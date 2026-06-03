/* ============================================================
   progress.js — מנוע מעקב משותף (רב-משתמשים) לכל המבחנים + ה"בית"
   נטען בכל מבחן עם <script src="progress.js"></script>.
   - נתונים נשמרים פר-משתמש (לפי שם) ב-localStorage: "mq_progress_v1::<שם>"
   - כל מבחן קורא MQ.record(...) בסיום; ה-index קורא getAll/aggregate/recommend.
   - רמת הקושי נשמרת בקטלוג פנימי בלבד — לא מוצגת לתלמיד.
   עובד גם בקובץ מקומי (file://) וגם באתר. הנתונים פר-דפדפן ופר-origin.
   ============================================================ */
(function (global) {
  "use strict";

  var BASE = "mq_progress_v1";        // בסיס המפתח; המפתח בפועל: BASE + "::" + user
  var CUR_KEY = "mq_current_user";    // שם המשתמש הפעיל
  var USERS_KEY = "mq_users";         // רשימת המשתמשים
  var GAME_KEY = "mathquest_v2";      // מצב המשחק (game.html) — לקריאה בלבד
  var GUEST = "אורח";
  var loadTime = Date.now();          // זמן טעינת הדף — לאומדן משך מבחן

  var TOPIC_NAMES = {
    // מתמטיקה
    polygons: "זוויות ומצולעים",
    linear: "פונקציה קווית",
    lineeq: "פונקציה קווית ושטח",
    systems: "מערכת משוואות",
    percent: "אחוזים",
    congruence: "חפיפת משולשים",
    pythagoras: "משפט פיתגורס",
    stats: "סטטיסטיקה",
    // מדעים — חשמל
    elec_circuit: "מעגל חשמלי",
    elec_current: "זרם חשמלי",
    elec_voltage: "מתח חשמלי",
    elec_resistance: "התנגדות ומוליכים",
    elec_wire: "אורך ועובי המוליך",
    elec_series_parallel: "חיבור בטור ובמקביל",
    elec_power: "הספק ואנרגיה",
    elec_safety: "בטיחות בחשמל",
    // מדעים — כוחות
    forces_contact: "כוחות מגע",
    forces_distance: "כוחות ממרחק",
    forces_newton3: "החוק השלישי של ניוטון"
  };

  // ---- קטלוג מבחנים: topics + level (1=קל,2=בינוני,3=קשה) — level פנימי בלבד ----
  var CATALOG = [
    // ---- מתמטיקה ----
    { id: "exam1", file: "exam.html",  subject: "math", title: "מבחן מסכם · א'",   level: 2, kind: "exam", topics: ["congruence","lineeq","systems","percent","pythagoras","stats"] },
    { id: "exam2", file: "exam2.html", subject: "math", title: "מבחן מסכם · ב'",   level: 2, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam5", file: "exam5.html", subject: "math", title: "מבחן + מעקב · ה'", level: 2, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam3", file: "exam3.html", subject: "math", title: "מבחן מסכם · ג'",   level: 3, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam4", file: "exam4.html", subject: "math", title: "מבחן מסכם · ד'",   level: 3, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam_l1a", file: "exam-l1a.html", subject: "math", title: "מבחן תרגול · ו'", level: 1, kind: "exam", topics: ["systems","percent","pythagoras","linear","polygons"] },
    { id: "exam_l1b", file: "exam-l1b.html", subject: "math", title: "מבחן תרגול · ז'", level: 1, kind: "exam", topics: ["systems","percent","pythagoras","stats","congruence"] },
    { id: "exam_l2a", file: "exam-l2a.html", subject: "math", title: "מבחן תרגול · ח'", level: 2, kind: "exam", topics: ["systems","percent","pythagoras","lineeq","polygons"] },
    { id: "exam_l2b", file: "exam-l2b.html", subject: "math", title: "מבחן תרגול · ט'", level: 2, kind: "exam", topics: ["systems","percent","pythagoras","stats","congruence"] },
    { id: "exam_l3a", file: "exam-l3a.html", subject: "math", title: "מבחן תרגול · י'", level: 3, kind: "exam", topics: ["systems","percent","pythagoras","lineeq","polygons"] },
    // ---- מדעים (חשמל + כוחות) — רמה פנימית בלבד, לא מוצגת לתלמיד ----
    { id: "sci1", file: "science-1.html", subject: "science", title: "תרגול מדעים · 1", level: 1, kind: "exam", topics: ["elec_circuit","elec_current","elec_voltage","elec_resistance","elec_wire","elec_series_parallel","elec_power","elec_safety"] },
    { id: "sci2", file: "science-2.html", subject: "science", title: "תרגול מדעים · 2", level: 1, kind: "exam", topics: ["elec_circuit","elec_current","elec_resistance","elec_series_parallel","elec_safety","forces_contact","forces_distance","forces_newton3"] },
    { id: "sci3", file: "science-3.html", subject: "science", title: "תרגול מדעים · 3", level: 1, kind: "exam", topics: ["forces_contact","forces_distance","forces_newton3","elec_voltage","elec_wire","elec_power","elec_series_parallel","elec_safety"] },
    { id: "sci4", file: "science-4.html", subject: "science", title: "תרגול מדעים · 4", level: 2, kind: "exam", topics: ["elec_circuit","elec_current","elec_voltage","elec_resistance","elec_wire","elec_series_parallel","elec_power","elec_safety"] },
    { id: "sci5", file: "science-5.html", subject: "science", title: "תרגול מדעים · 5", level: 2, kind: "exam", topics: ["elec_resistance","elec_wire","elec_series_parallel","elec_power","elec_safety","forces_contact","forces_distance","forces_newton3"] },
    { id: "sci6", file: "science-6.html", subject: "science", title: "תרגול מדעים · 6", level: 2, kind: "exam", topics: ["elec_voltage","elec_power","elec_series_parallel","elec_resistance","elec_safety","forces_contact","forces_distance","forces_newton3"] },
    { id: "sci7", file: "science-7.html", subject: "science", title: "תרגול מדעים · 7", level: 3, kind: "exam", topics: ["elec_power","elec_current","elec_voltage","elec_wire","elec_series_parallel","elec_safety"] },
    { id: "sci8", file: "science-8.html", subject: "science", title: "תרגול מדעים · 8", level: 3, kind: "exam", topics: ["elec_power","elec_safety","elec_series_parallel","elec_resistance","forces_contact","forces_distance","forces_newton3"] },
    // ---- תרגול ממוקד דינמי (focus.html) — מתייג מקצוע בלבד; topics ריק כדי שלא ישמש כיעד המלצה ----
    { id: "focus_math",    file: "focus.html", subject: "math",    title: "תרגול ממוקד", level: 0, kind: "focus", topics: [] },
    { id: "focus_science", file: "focus.html", subject: "science", title: "תרגול ממוקד", level: 0, kind: "focus", topics: [] }
  ];

  // ---- משקלי נושאים במבחן אמיתי (לחיזוי ציון). סכום=1 לכל מקצוע. ----
  // (ניתן לכיול מחדש ע"י סוכן ה-curriculum-expert לפי מבחני משרד החינוך)
  var EXAM_WEIGHTS = {
    math: { systems: 0.22, percent: 0.14, lineeq: 0.13, pythagoras: 0.12, polygons: 0.12, congruence: 0.10, linear: 0.09, stats: 0.08 },
    science: {
      elec_circuit: 0.10, elec_current: 0.10, elec_voltage: 0.10, elec_resistance: 0.10,
      elec_wire: 0.08, elec_series_parallel: 0.12, elec_power: 0.12, elec_safety: 0.08,
      forces_contact: 0.07, forces_distance: 0.07, forces_newton3: 0.06
    }
  };

  // ---- עזרי localStorage ----
  function readJSON(k, fallback) {
    try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---- ניהול משתמשים ----
  function listUsers() { var u = readJSON(USERS_KEY, []); return Array.isArray(u) ? u : []; }
  function currentUser() { try { return localStorage.getItem(CUR_KEY) || null; } catch (e) { return null; } }
  function activeUser() { return currentUser() || GUEST; }
  function userKey(name) { return BASE + "::" + (name || GUEST); }
  function setUser(name) {
    name = (name || "").trim();
    if (!name) return false;
    var users = listUsers();
    if (users.indexOf(name) < 0) { users.push(name); writeJSON(USERS_KEY, users); }
    try { localStorage.setItem(CUR_KEY, name); } catch (e) {}
    return true;
  }
  function deleteUser(name) {
    var users = listUsers().filter(function (u) { return u !== name; });
    writeJSON(USERS_KEY, users);
    try { localStorage.removeItem(userKey(name)); } catch (e) {}
    if (currentUser() === name) { try { localStorage.removeItem(CUR_KEY); } catch (e) {} }
  }

  // ---- הגירה חד-פעמית: נתוני גרסה ישנה (גלובליים) → פרופיל ברירת מחדל ----
  (function migrateLegacy() {
    try {
      var legacy = localStorage.getItem(BASE);
      if (legacy && listUsers().length === 0 && !currentUser()) {
        var name = "ברירת מחדל";
        writeJSON(userKey(name), readJSON(BASE, { attempts: [] }));
        writeJSON(USERS_KEY, [name]);
        localStorage.setItem(CUR_KEY, name);
        localStorage.removeItem(BASE);
      }
    } catch (e) {}
  })();

  function load() { var d = readJSON(userKey(activeUser()), { attempts: [] }); return (d && Array.isArray(d.attempts)) ? d : { attempts: [] }; }
  function save(d) { writeJSON(userKey(activeUser()), d); }

  // ---- חישוב פירוט לפי נושא ----
  function computeByTopic(EXAM, earned) {
    var byTopic = {};
    EXAM.forEach(function (q) {
      var t = q.topic || "other";
      if (!byTopic[t]) byTopic[t] = { got: 0, pts: 0 };
      (q.parts || []).forEach(function (p) {
        byTopic[t].pts += (p.points || 0);
        var key = q.id + p.id;
        byTopic[t].got += (earned && earned[key]) ? earned[key] : 0;
      });
    });
    return byTopic;
  }

  var _recorded = false; // דה-דופ לטעינת דף

  function record(examId, title, EXAM, earned, meta) {
    if (_recorded || !Array.isArray(EXAM)) return;
    _recorded = true;

    var byTopic = computeByTopic(EXAM, earned);
    var got = 0, pts = 0;
    Object.keys(byTopic).forEach(function (t) { got += byTopic[t].got; pts += byTopic[t].pts; });
    var pct = pts > 0 ? Math.round(got / pts * 100) : 0;
    var cat = CATALOG.filter(function (c) { return c.id === examId; })[0];

    var attempt = {
      examId: examId, title: title, ts: Date.now(),
      score: got, total: pts, pct: pct, byTopic: byTopic,
      durationMs: (meta && meta.durationMs) || Math.max(0, Date.now() - loadTime),
      level: cat ? cat.level : null,
      subject: cat ? cat.subject : ((meta && meta.subject) || "math"),
      user: activeUser()
    };

    // אם נרשם תחת משתמש פעיל שאינו ברשימה — הוסף אותו
    if (currentUser() && listUsers().indexOf(currentUser()) < 0) setUser(currentUser());

    var data = load();
    save({ attempts: data.attempts.concat([attempt]) });
    return attempt;
  }

  function getAll(subject) {
    var all = load().attempts.slice();
    if (!subject) return all;
    return all.filter(function (a) { return (a.subject || "math") === subject; });
  }

  // ---- צבירה לפי נושא: last/best/avg/attempts + אומדן קצב ----
  function aggregate(subject) {
    var attempts = getAll(subject);
    var acc = {};
    attempts.forEach(function (a) {
      Object.keys(a.byTopic || {}).forEach(function (t) {
        var bt = a.byTopic[t];
        if (!bt.pts) return;
        var p = Math.round(bt.got / bt.pts * 100);
        if (!acc[t]) acc[t] = { samples: [], last: null, lastTs: 0 };
        acc[t].samples.push(p);
        if (a.ts >= acc[t].lastTs) { acc[t].lastTs = a.ts; acc[t].last = p; }
      });
    });
    var out = {};
    Object.keys(acc).forEach(function (t) {
      var s = acc[t].samples;
      var sum = s.reduce(function (x, y) { return x + y; }, 0);
      out[t] = {
        topic: t, name: TOPIC_NAMES[t] || t,
        attempts: s.length, avg: Math.round(sum / s.length),
        best: Math.max.apply(null, s), last: acc[t].last
      };
    });
    return out;
  }

  // ---- המלצה אדפטיבית: נושא חלש → משאב ברמה מתאימה (level פנימי) ----
  function recommend(subject) {
    var agg = aggregate(subject);
    var topics = Object.keys(agg).map(function (t) { return agg[t]; });
    if (!topics.length) return null;
    topics.sort(function (a, b) { return a.last - b.last; });
    var t = topics[0];

    // רמת יעד לפי הציון האחרון: <60 קל · 60-84 בינוני · ≥85 קשה
    var band = t.last < 60 ? 1 : (t.last < 85 ? 2 : 3);

    var done = {}; getAll(subject).forEach(function (a) { done[a.examId] = true; });
    var cands = CATALOG.filter(function (c) { return c.topics.indexOf(t.topic) >= 0 && (!subject || c.subject === subject); });
    cands.sort(function (a, b) {
      var d = Math.abs(a.level - band) - Math.abs(b.level - band);   // קרוב לרמת היעד
      if (d) return d;
      var k = (a.kind === "practice" ? 0 : 1) - (b.kind === "practice" ? 0 : 1); // עדיפות לתרגול ממוקד
      if (k) return k;
      return (done[a.id] ? 1 : 0) - (done[b.id] ? 1 : 0);            // עדיפות למה שעוד לא נעשה
    });

    return { topic: t.topic, name: t.name, last: t.last, band: band, resource: cands[0] || null };
  }

  // ---- חיזוי ציון במבחן: ממוצע משוקלל של שליטה לפי נושא ----
  function predict(subject) {
    var agg = aggregate(subject);
    var weights = EXAM_WEIGHTS[subject] || {};
    var keys = Object.keys(weights);
    var coveredW = 0, sum = 0, per = [];
    keys.forEach(function (t) {
      var a = agg[t]; if (!a) return;                 // אין נתונים → לא נכלל, מוריד ביטחון
      var m = Math.round(0.7 * a.last + 0.3 * a.best); // שליטה: נוטה לאחרון, מתגמל שיא
      coveredW += weights[t]; sum += weights[t] * m;
      per.push({ topic: t, name: a.name, mastery: m, weight: weights[t] });
    });
    if (!per.length) return null;
    var grade = Math.round(sum / coveredW);            // נרמול מעל הנושאים שנבדקו
    var attemptsCount = getAll(subject).length;
    var conf = (coveredW >= 0.8 && attemptsCount >= 4) ? "high"
             : ((coveredW >= 0.5 && attemptsCount >= 2) ? "medium" : "low");
    per.sort(function (a, b) { return a.mastery - b.mastery; });
    return { grade: grade, confidence: conf, weakest: per.slice(0, 3),
             covered: per.length, total: keys.length, coverageW: Math.round(coveredW * 100) };
  }

  function readGameState() { return readJSON(GAME_KEY, null); }
  function clearAll() { try { localStorage.removeItem(userKey(activeUser())); } catch (e) {} }

  global.MQ = {
    TOPIC_NAMES: TOPIC_NAMES,
    CATALOG: CATALOG,
    record: record,
    getAll: getAll,
    aggregate: aggregate,
    recommend: recommend,
    predict: predict,
    EXAM_WEIGHTS: EXAM_WEIGHTS,
    readGameState: readGameState,
    clearAll: clearAll,
    // משתמשים
    listUsers: listUsers,
    currentUser: currentUser,
    setUser: setUser,
    deleteUser: deleteUser,
    BASE: BASE
  };
})(window);
