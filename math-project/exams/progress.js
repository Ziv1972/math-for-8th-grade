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
    polygons: "זוויות ומצולעים",
    linear: "פונקציה קווית",
    lineeq: "פונקציה קווית ושטח",
    systems: "מערכת משוואות",
    percent: "אחוזים",
    congruence: "חפיפת משולשים",
    pythagoras: "משפט פיתגורס",
    stats: "סטטיסטיקה"
  };

  // ---- קטלוג מבחנים: topics + level (1=קל,2=בינוני,3=קשה) — level פנימי בלבד ----
  var CATALOG = [
    { id: "exam1", file: "exam.html",  title: "מבחן מסכם · א'",   level: 2, kind: "exam", topics: ["congruence","lineeq","systems","percent","pythagoras","stats"] },
    { id: "exam2", file: "exam2.html", title: "מבחן מסכם · ב'",   level: 2, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam5", file: "exam5.html", title: "מבחן + מעקב · ה'", level: 2, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam3", file: "exam3.html", title: "מבחן מתקדם · ג'",  level: 3, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    { id: "exam4", file: "exam4.html", title: "מבחן אתגר · ד'",   level: 3, kind: "exam", topics: ["polygons","lineeq","systems","percent","pythagoras"] },
    // מבחני תרגול חדשים — רמה (level) פנימית בלבד, לא מוצגת לתלמיד
    { id: "exam_l1a", file: "exam-l1a.html", title: "מבחן תרגול · ו'", level: 1, kind: "exam", topics: ["systems","percent","pythagoras","linear"] },
    { id: "exam_l1b", file: "exam-l1b.html", title: "מבחן תרגול · ז'", level: 1, kind: "exam", topics: ["systems","percent","pythagoras","stats"] },
    { id: "exam_l2a", file: "exam-l2a.html", title: "מבחן תרגול · ח'", level: 2, kind: "exam", topics: ["systems","percent","pythagoras","lineeq"] },
    { id: "exam_l2b", file: "exam-l2b.html", title: "מבחן תרגול · ט'", level: 2, kind: "exam", topics: ["systems","percent","pythagoras","stats"] },
    { id: "exam_l3a", file: "exam-l3a.html", title: "מבחן תרגול · י'", level: 3, kind: "exam", topics: ["systems","percent","pythagoras","lineeq"] }
  ];

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
      user: activeUser()
    };

    // אם נרשם תחת משתמש פעיל שאינו ברשימה — הוסף אותו
    if (currentUser() && listUsers().indexOf(currentUser()) < 0) setUser(currentUser());

    var data = load();
    save({ attempts: data.attempts.concat([attempt]) });
    return attempt;
  }

  function getAll() { return load().attempts.slice(); }

  // ---- צבירה לפי נושא: last/best/avg/attempts + אומדן קצב ----
  function aggregate() {
    var attempts = getAll();
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
  function recommend() {
    var agg = aggregate();
    var topics = Object.keys(agg).map(function (t) { return agg[t]; });
    if (!topics.length) return null;
    topics.sort(function (a, b) { return a.last - b.last; });
    var t = topics[0];

    // רמת יעד לפי הציון האחרון: <60 קל · 60-84 בינוני · ≥85 קשה
    var band = t.last < 60 ? 1 : (t.last < 85 ? 2 : 3);

    var done = {}; getAll().forEach(function (a) { done[a.examId] = true; });
    var cands = CATALOG.filter(function (c) { return c.topics.indexOf(t.topic) >= 0; });
    cands.sort(function (a, b) {
      var d = Math.abs(a.level - band) - Math.abs(b.level - band);   // קרוב לרמת היעד
      if (d) return d;
      var k = (a.kind === "practice" ? 0 : 1) - (b.kind === "practice" ? 0 : 1); // עדיפות לתרגול ממוקד
      if (k) return k;
      return (done[a.id] ? 1 : 0) - (done[b.id] ? 1 : 0);            // עדיפות למה שעוד לא נעשה
    });

    return { topic: t.topic, name: t.name, last: t.last, band: band, resource: cands[0] || null };
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
