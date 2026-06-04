/* ============================================================
   exam-engine.js — מנוע מבחן משותף (דק) למבחנים החדשים.
   קובץ מבחן טוען: exam-engine.css + progress.js + exam-engine.js,
   ואז קורא MQExam.run({examId,title,kicker,EXAM}).
   המנוע בונה את הדף, בודק תשובות, ובסיום קורא ל-MQ.record (מעקב פר-משתמש).
   רמת הקושי אינה מוצגת לתלמיד — היא נשמרת רק ב-CATALOG שב-progress.js.
   הערה: רינדור תוכן מתמטי (נוסחאות/SVG) נעשה דרך createContextualFragment
   על מחרוזות מהימנות (מחבר התוכן) — לא innerHTML.
   ============================================================ */
(function (global) {
  "use strict";

  // המרת מחרוזת HTML מהימנה לפרגמנט DOM (לא מריץ סקריפטים)
  function frag(html) { return document.createRange().createContextualFragment(html); }
  function fill(el, html) { el.replaceChildren(frag(html)); return el; }

  function parseNum(s) {
    if (s == null) return NaN;
    var c = String(s).trim().replace(/\s/g, "").replace(",", ".");
    if (c === "") return NaN;
    if (c.indexOf("/") >= 0) { var p = c.split("/"); return Number(p[0]) / Number(p[1]); }
    return Number(c);
  }
  function approxEq(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01); }

  function run(cfg) {
    var EXAM = cfg.EXAM, examId = cfg.examId, title = cfg.title;
    var earned = {}, totalPoints = 0;
    EXAM.forEach(function (q) { (q.parts || []).forEach(function (p) { totalPoints += p.points || 0; }); });
    var start = Date.now();

    // ---- מעקב per-שאלה (מזין את MQ.predict / questionStats) ----
    var log = {};
    function L(q, p) {
      var k = q.id + p.id;
      if (!log[k]) log[k] = { qid: q.id, pid: p.id, topic: q.topic, points: p.points || 0,
        attempts: 0, wrong: 0, hintUsed: false, peeked: false, solved: false, firstTryCorrect: false, timeMs: 0 };
      return log[k];
    }
    var activeKey = null, activeTs = 0;
    function flushTime() { if (activeKey && log[activeKey]) log[activeKey].timeMs += Date.now() - activeTs; activeKey = null; }
    function focusPart(k) { flushTime(); activeKey = k; activeTs = Date.now(); }

    var bar = document.createElement("div"); bar.className = "scorebar";
    fill(bar, `<span class="label">ציון</span><div class="track"><div class="fill" id="scoreFill"></div></div><span class="pct" id="scorePct">0 / ${totalPoints}</span><span class="timer" id="globalTimer">0:00</span><a class="home" href="index.html">⌂ בית</a>`);
    document.body.appendChild(bar);

    var sheet = document.createElement("div"); sheet.className = "sheet";
    var head = document.createElement("div"); head.className = "exam-head";
    fill(head, `<div class="kicker">${cfg.kicker || "מתמטיקה · כיתה ח"}</div><h1>${title}</h1><div class="meta"><span>📝 <b>${EXAM.length} שאלות</b></span><span>💯 <b>${totalPoints} נקודות</b></span></div>`);
    sheet.appendChild(head);
    var body = document.createElement("div"); body.id = "examBody"; sheet.appendChild(body);
    var finish = document.createElement("div"); finish.className = "finish"; finish.id = "finishBox";
    fill(finish, `<h2>סיימת את התרגול! 🎓</h2><div class="final-score" id="finalScore">0</div><div class="msg" id="finalMsg"></div><div class="next-loop" id="nextLoop"></div><div class="actions"><a class="btn primary" href="index.html">חזרה לדף הבית</a><button class="btn ghost" onclick="location.reload()">התחל מחדש</button></div>`);
    sheet.appendChild(finish);
    document.body.appendChild(sheet);

    setInterval(function () {
      var s = Math.floor((Date.now() - start) / 1000);
      var m = Math.floor(s / 60), ss = String(s % 60).padStart(2, "0");
      var t = document.getElementById("globalTimer"); if (t) t.textContent = m + ":" + ss;
    }, 1000);

    var finished = false;
    function updateScore() {
      var sum = 0; Object.keys(earned).forEach(function (k) { sum += earned[k]; });
      var pct = totalPoints ? Math.round(sum / totalPoints * 100) : 0;
      document.getElementById("scoreFill").style.width = pct + "%";
      document.getElementById("scorePct").textContent = sum + " / " + totalPoints;
      var answered = 0, totalParts = 0;
      EXAM.forEach(function (q) { (q.parts || []).forEach(function (p) { totalParts++; if (earned[q.id + p.id] !== undefined) answered++; }); });
      if (answered >= totalParts && !finished) { finished = true; showFinish(sum, pct); }
    }
    function showFinish(sum, pct) {
      flushTime();
      var attempt = global.MQ ? global.MQ.record(examId, title, EXAM, earned, { durationMs: Date.now() - start, log: log }) : null;
      var box = document.getElementById("finishBox"); box.classList.add("show");
      document.getElementById("finalScore").textContent = sum + " / " + totalPoints;
      var msg;
      if (pct >= 90) msg = "מצוין! שליטה גבוהה 🌟";
      else if (pct >= 75) msg = "כל הכבוד! רמה טובה מאוד";
      else if (pct >= 55) msg = "לא רע — יש מה לחזק";
      else msg = "שווה לחזור על החומר ולתרגל שוב";
      document.getElementById("finalMsg").textContent = msg;
      if (attempt) renderNextLoop(attempt.subject);   // סגירת הלולאה: צפי מעודכן + תרגול טרי על החולשות
      box.scrollIntoView({ behavior: "smooth" });
    }

    // אוטופיילוט: בכל סיום — מציג צפי מעודכן ומציע תרגול ממוקד טרי (מחולל אינסופי) על הנושאים החלשים
    function renderNextLoop(subject) {
      var host = document.getElementById("nextLoop"); if (!host || !global.MQ) return;
      while (host.firstChild) host.removeChild(host.firstChild);
      var pred = global.MQ.predict(subject);
      var card = document.createElement("div"); card.className = "nl-card";
      var lbl = document.createElement("div"); lbl.className = "nl-lbl";
      if (pred) {
        lbl.textContent = "🎯 צפי מעודכן למבחן: " + pred.grade + (pred.confidence === "low" ? " (הערכה ראשונית)" : "");
        card.appendChild(lbl);
        if (pred.weakest && pred.weakest.length) {
          var w = document.createElement("div"); w.className = "nl-weak";
          w.textContent = "לחיזוק עכשיו: " + pred.weakest.map(function (x) { return x.name; }).join(" · ");
          card.appendChild(w);
        }
      } else {
        lbl.textContent = "🎯 פתרו עוד מבחנים כדי שאחשב צפי אמין.";
        card.appendChild(lbl);
      }
      var a = document.createElement("a"); a.className = "nl-btn";
      a.href = "focus.html?subject=" + subject;
      a.textContent = "⚡ תרגול ממוקד טרי על החולשות";
      card.appendChild(a);
      host.appendChild(card);
    }

    function makePart(q, p) {
      var div = document.createElement("div"); div.className = "part"; var key = q.id + p.id;
      if (p.type === "mcq") {
        fill(div, `<div class="part-q"><span class="part-label">${p.label}</span><span>${p.text}</span><span class="part-pts">${p.points} נק</span></div><div class="opts"></div><span class="verdict"></span><div class="tools">${p.solution ? `<button class="btn-sol" disabled>🔒 פתרון</button>` : ""}</div>${p.solution ? `<div class="sol-box">${p.solution}</div>` : ""}`);
        var opts = div.querySelector(".opts"), verdict = div.querySelector(".verdict"), solBtn = div.querySelector(".btn-sol"), answered = false;
        p.options.forEach(function (o, i) {
          var b = document.createElement("button"); b.className = "opt"; b.appendChild(frag(o));
          b.onclick = function () {
            if (answered) return; answered = true;
            var lg = L(q, p); lg.attempts = 1; flushTime();
            if (i === p.correct) { b.classList.add("ok"); verdict.className = "verdict ok"; verdict.textContent = "✓ נכון"; earned[key] = p.points; lg.solved = true; lg.firstTryCorrect = true; }
            else { b.classList.add("bad"); verdict.className = "verdict bad"; verdict.textContent = "✗ לא נכון"; opts.children[p.correct].classList.add("reveal"); earned[key] = 0; lg.wrong = 1; }
            if (solBtn) { solBtn.disabled = false; solBtn.textContent = "פתרון"; }
            updateScore();
          };
          opts.appendChild(b);
        });
      } else {
        var answers = Array.isArray(p.answer) ? p.answer : [p.answer];
        fill(div, `<div class="part-q"><span class="part-label">${p.label}</span><span>${p.text}</span><span class="part-pts">${p.points} נק</span></div><div class="part-row"><input class="ans" placeholder="תשובה" inputmode="decimal"><button class="btn-check">בדיקה</button><span class="verdict"></span></div><div class="tools">${p.hint ? `<button class="btn-hint">💡 רמז</button>` : ""}${p.solution ? `<button class="btn-sol" disabled>🔒 פתרון</button>` : ""}</div>${p.hint ? `<div class="hint-box">${p.hint}</div>` : ""}${p.solution ? `<div class="sol-box">${p.solution}</div>` : ""}`);
        var input = div.querySelector(".ans"), verdict2 = div.querySelector(".verdict"), solBtn2 = div.querySelector(".btn-sol");
        var check = function () {
          var lg = L(q, p);
          if (lg.solved) return;            // כבר נפתר — אל תספור ניסיון נוסף
          var u = parseNum(input.value);
          if (solBtn2 && solBtn2.disabled) { solBtn2.disabled = false; solBtn2.textContent = "פתרון"; }
          if (isNaN(u)) { input.className = "ans bad"; verdict2.className = "verdict bad"; verdict2.textContent = "הזן מספר"; return; }
          lg.attempts++;
          var good = answers.some(function (a) { return approxEq(u, a, p.tolerance || (Math.abs(a) < 1 ? 0.01 : 0.05)); });
          if (good) { input.className = "ans ok"; verdict2.className = "verdict ok"; verdict2.textContent = "✓ נכון"; earned[key] = p.points; lg.solved = true; if (lg.attempts === 1 && lg.wrong === 0) lg.firstTryCorrect = true; flushTime(); }
          else { input.className = "ans bad"; verdict2.className = "verdict bad"; verdict2.textContent = "✗ נסה שוב"; if (earned[key] === undefined) earned[key] = 0; lg.wrong++; }
          updateScore();
        };
        div.querySelector(".btn-check").onclick = check;
        input.addEventListener("focus", function () { focusPart(key); });
        input.addEventListener("blur", flushTime);
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
      }
      var hintBtn = div.querySelector(".btn-hint");
      if (hintBtn) { var hb = div.querySelector(".hint-box"); hintBtn.onclick = function () { hb.classList.toggle("show"); L(q, p).hintUsed = true; }; }
      var sBtn = div.querySelector(".btn-sol");
      if (sBtn) { var sb = div.querySelector(".sol-box"); sBtn.onclick = function () { if (sBtn.disabled) return; sb.classList.toggle("show"); L(q, p).peeked = true; }; }
      return div;
    }

    EXAM.forEach(function (q, qi) {
      var card = document.createElement("div"); card.className = "q"; card.id = "card-" + q.id;
      fill(card, `<div class="q-head"><span class="q-badge">${qi + 1}</span><span class="q-title">${q.title}</span><span class="q-points">${q.points} נק</span></div><div class="q-stem">${q.stem}</div>${q.svg ? `<div class="q-svg">${q.svg}</div>` : ""}`);
      (q.parts || []).forEach(function (p) { card.appendChild(makePart(q, p)); });
      body.appendChild(card);
    });
  }

  global.MQExam = { run: run };
})(window);
