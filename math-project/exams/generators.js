/* ============================================================
   generators.js — מחוללי שאלות דינמיים (מספרים אקראיים) לנושאים החישוביים.
   כל מחולל מחזיר אובייקט שאלה תואם exam-engine; התשובה מחושבת מאותם
   פרמטרים → נכונה בהגדרתה. focus.html משתמש בהם לבניית תרגול ממוקד טרי.
   ============================================================ */
(function (global) {
  "use strict";
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function F(html) { return '<span class="formula" dir="ltr">' + html + '</span>'; }
  function lin(m, b) { return "y = " + (m < 0 ? "−" + (-m) : "" + m) + "x" + (b === 0 ? "" : (b > 0 ? " + " + b : " − " + (-b))); }
  function mk(topic, title, stem, answer, hint, solution) {
    return { topic: topic, title: title, stem: stem,
      parts: [{ id: "a", label: "", text: "התשובה:", type: "number", answer: answer, hint: hint || "", solution: solution || ("<b>" + answer + "</b>") }] };
  }
  function mkMcq(topic, title, stem, options, correct, solution) {
    return { topic: topic, title: title, stem: stem,
      parts: [{ id: "a", label: "", text: "", type: "mcq", options: options, correct: correct, solution: solution || "" }] };
  }

  function gSystems() {
    var x = rnd(1, 6), y = rnd(1, 6);
    var a1 = rnd(1, 3), b1 = rnd(1, 3), a2 = rnd(1, 3), b2 = rnd(1, 3);
    while (a1 * b2 - a2 * b1 === 0) { a2 = rnd(1, 3); b2 = rnd(1, 3); }
    var c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
    var eq = function (a, b, c) { return a + "x + " + b + "y = " + c; };
    return mk("systems", "מערכת משוואות",
      "פתרו את המערכת: " + F(eq(a1, b1, c1)) + " , " + F(eq(a2, b2, c2)) + ".",
      x, "שיטת החיבור או ההצבה", "הפתרון: <b>x = " + x + "</b> (ו-y = " + y + "). בדיקה מציבים במשוואות.");
  }
  function gPercent() {
    var t = rnd(1, 4);
    if (t === 1) { var p = pick([10, 20, 25, 50]), n = pick([40, 80, 120, 160, 200, 300]);
      return mk("percent", "אחוז מערך", "כמה זה " + F(p + "%") + " מתוך " + n + "?", p / 100 * n, p / 100 + " · " + n, "<b>" + (p / 100 * n) + "</b>"); }
    if (t === 2) { var pr = pick([80, 120, 160, 200, 240]), d = pick([10, 25, 50]);
      return mk("percent", "הנחה", "מוצר עלה " + pr + ' ש"ח וירד בהנחה של ' + F(d + "%") + '. מהו המחיר החדש (בש"ח)?', r1(pr * (1 - d / 100)), pr + " · " + (1 - d / 100), "<b>" + r1(pr * (1 - d / 100)) + ' ש"ח</b>'); }
    if (t === 3) { var p2 = pick([20, 25, 40, 50]), whole = pick([100, 200, 300, 400]);
      return mk("percent", "מציאת השלם", F(p2 + "%") + " ממספר שווה " + (p2 / 100 * whole) + ". מהו המספר?", whole, (p2 / 100 * whole) + " ÷ " + (p2 / 100), "<b>" + whole + "</b>"); }
    var old = pick([80, 100, 200]), inc = pick([10, 20, 25, 50]), nw = r1(old * (1 + inc / 100));
    return mk("percent", "אחוז שינוי", "מחיר עלה מ-" + old + ' ש"ח ל-' + nw + ' ש"ח. בכמה אחוזים עלה?', inc, "((" + nw + "−" + old + ")÷" + old + ")·100", "<b>" + inc + "%</b>");
  }
  function gPythagoras() {
    var tr = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]]);
    var k = pick([1, 1, 2]); var a = tr[0] * k, b = tr[1] * k, c = tr[2] * k;
    if (rnd(0, 1) === 0) return mk("pythagoras", "משפט פיתגורס", "במשולש ישר-זווית הניצבים הם " + F(a) + " ו-" + F(b) + ' ס"מ. מהו אורך היתר?', c, "√(" + a + "² + " + b + "²)", "√(" + (a * a) + " + " + (b * b) + ") = <b>" + c + '</b> ס"מ');
    return mk("pythagoras", "משפט פיתגורס", "במשולש ישר-זווית היתר הוא " + F(c) + " וניצב אחד " + F(a) + ' ס"מ. מהו הניצב השני?', b, "√(" + c + "² − " + a + "²)", "√(" + (c * c) + " − " + (a * a) + ") = <b>" + b + '</b> ס"מ');
  }
  function gLineeq() {
    var xint = pick([2, 3, 4, 5]);
    if (rnd(0, 1) === 0) {
      var m = pick([2, 3, 4, -2, -3]), b = -m * xint;
      return mk("lineeq", "פונקציה קווית", "נתון הישר " + F(lin(m, b)) + ". באיזה x הוא חותך את ציר ה-x?", xint, "הצב y=0", "<b>x = " + xint + "</b>");
    }
    var m2 = pick([2, 4, -2]), b2 = -m2 * xint, area = Math.abs(xint * b2) / 2; // m זוגי → שטח שלם
    return mk("lineeq", "שטח על מערכת צירים", "הישר " + F(lin(m2, b2)) + ' חותך את הצירים. מהו שטח המשולש שנוצר עם הצירים (יח"ר)?', area, "(|חיתוך-x| · |חיתוך-y|) ÷ 2", "ניצבים " + Math.abs(xint) + " ו-" + Math.abs(b2) + " → (" + Math.abs(xint) + "·" + Math.abs(b2) + ")÷2 = <b>" + area + '</b> יח"ר');
  }
  function gLinear() {
    if (rnd(1, 2) === 1) {
      var m = pick([2, 3, 4, -2]), x1 = pick([0, 1, 2]), y1 = pick([1, 2, 3]), dx = pick([1, 2]), x2 = x1 + dx, y2 = y1 + m * dx;
      return mk("linear", "שיפוע הישר", "מהו שיפוע הישר העובר דרך " + F("(" + x1 + ", " + y1 + ")") + " ו-" + F("(" + x2 + ", " + y2 + ")") + "?", m, "(y₂−y₁) ÷ (x₂−x₁)", "<b>" + m + "</b>");
    }
    var mm = pick([2, 3, 4]), px = pick([1, 2, 3]), py = pick([2, 5, 7, 8]), bb = py - mm * px;
    return mk("linear", "חיתוך עם ציר y", "הישר " + F("y = " + mm + "x + b") + " עובר דרך " + F("(" + px + ", " + py + ")") + ". מהו b?", bb, "הצב את הנקודה במשוואה", "<b>b = " + bb + "</b>");
  }
  function gElecPower() {
    var t = rnd(1, 3);
    if (t === 1) { var w = pick([500, 1500, 2000, 2500, 3000]); return mk("elec_power", "ואט לקילוואט", "מכשיר בהספק " + w + " ואט. כמה קילוואט זה?", w / 1000, "÷ 1000", "<b>" + (w / 1000) + " קילוואט</b>"); }
    if (t === 2) { var kw = pick([1, 1.5, 2, 2.5, 3]), h = pick([2, 3, 4, 5]); return mk("elec_power", 'אנרגיה (קוט"ש)', "מכשיר בהספק " + kw + " קילוואט פעל " + h + ' שעות. כמה קוט"ש צרך?', r1(kw * h), "הספק × זמן", "<b>" + r1(kw * h) + ' קוט"ש</b>'); }
    var kwh = pick([3, 4, 5, 6, 8]), price = pick([0.5, 0.6]); return mk("elec_power", "עלות חשמל", "מכשיר צרך " + kwh + ' קוט"ש, ומחיר קוט"ש ' + price + ' ש"ח. כמה ישולם?', r1(kwh * price), 'קוט"ש × מחיר', "<b>" + r1(kwh * price) + ' ש"ח</b>');
  }

  function gPolygons() {
    var t = rnd(1, 4);
    if (t === 1) {
      var apex = pick([40, 50, 70, 80, 100, 120]); var base = (180 - apex) / 2;
      return mk("polygons", "משולש שווה-שוקיים", "במשולש שווה-שוקיים זווית הראש היא " + F(apex + "°") + ". מהי כל אחת מזוויות הבסיס (במעלות)?", base, "(180−" + apex + ")÷2", "(180−" + apex + ")÷2 = <b>" + base + "°</b>");
    }
    if (t === 2) {
      var bb = pick([40, 50, 55, 65, 70, 75]); var apex2 = 180 - 2 * bb;
      return mk("polygons", "משולש שווה-שוקיים", "במשולש שווה-שוקיים כל זווית בסיס היא " + F(bb + "°") + ". מהי זווית הראש (במעלות)?", apex2, "180−2·" + bb, "180−2·" + bb + " = <b>" + apex2 + "°</b>");
    }
    if (t === 3) {
      var names = { 5: "מחומש", 6: "משושה", 7: "משובע", 8: "מתומן", 10: "מעושר" };
      var n = pick([5, 6, 7, 8, 10]); var s = (n - 2) * 180;
      return mk("polygons", "סכום זוויות מצולע", "מהו סכום הזוויות הפנימיות ב" + names[n] + " (מצולע בעל " + F(n) + " צלעות)?", s, "(" + n + "−2)·180", "(" + n + "−2)·180 = <b>" + s + "°</b>");
    }
    var n2 = pick([3, 4, 5, 6, 9, 10, 12]); var ang = (n2 - 2) * 180 / n2;
    return mk("polygons", "מצולע משוכלל", "במצולע משוכלל בעל " + F(n2) + " צלעות — מהי כל זווית פנימית (במעלות)?", ang, "(" + n2 + "−2)·180 ÷ " + n2, "(" + n2 + "−2)·180÷" + n2 + " = <b>" + ang + "°</b>");
  }
  function gStats() {
    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var t = rnd(1, 3);
    if (t === 1) {
      var d; do { d = [rnd(2, 20), rnd(2, 20), rnd(2, 20), rnd(2, 20), rnd(2, 20)]; } while (sum(d) % 5 !== 0);
      var mean = sum(d) / 5;
      return mk("stats", "ממוצע", "נתונים: " + F(d.join(", ")) + ". מהו הממוצע?", mean, "סכום הערכים ÷ 5", "סכום=" + sum(d) + " → ÷5 = <b>" + mean + "</b>");
    }
    if (t === 2) {
      var arr = [rnd(1, 30), rnd(1, 30), rnd(1, 30), rnd(1, 30), rnd(1, 30)];
      var sorted = arr.slice().sort(function (a, b) { return a - b; });
      return mk("stats", "חציון", "נתונים: " + F(arr.join(", ")) + ". מהו החציון?", sorted[2], "מסדרים מקטן לגדול ובוחרים את האמצעי", "מסודר: " + F(sorted.join(", ")) + " → <b>" + sorted[2] + "</b>");
    }
    var v = rnd(1, 9), pool = []; for (var i = 1; i <= 14; i++) if (i !== v) pool.push(i);
    var o1 = pick(pool), o2; do { o2 = pick(pool); } while (o2 === o1);
    var data = [v, v, v, o1, o2].sort(function () { return Math.random() - 0.5; });
    return mk("stats", "שכיח", "נתונים: " + F(data.join(", ")) + ". מהו השכיח (הערך הנפוץ ביותר)?", v, "הערך שחוזר הכי הרבה פעמים", "<b>" + v + "</b> — מופיע 3 פעמים");
  }
  function gCongruence() {
    var OPTS = ["צ.צ.צ (שלוש צלעות)", "צ.ז.צ (צלע-זווית-צלע)", "ז.צ.ז (זווית-צלע-זווית)"];
    var scen = pick([
      { s: "בשני משולשים שלוש הצלעות של האחד שוות בהתאמה לשלוש הצלעות של השני.", c: 0 },
      { s: "בשני משולשים שתי צלעות והזווית שביניהן שוות בהתאמה.", c: 1 },
      { s: "בשני משולשים שתי זוויות והצלע שביניהן שוות בהתאמה.", c: 2 },
      { s: "נתון: " + F("AB = DE") + ", " + F("AC = DF") + ", וגם " + F("∠A = ∠D") + ".", c: 1 },
      { s: "נתון: " + F("∠B = ∠E") + ", " + F("∠C = ∠F") + ", והצלע " + F("BC = EF") + ".", c: 2 }
    ]);
    return mkMcq("congruence", "חפיפת משולשים", scen.s + " לפי איזה משפט חפיפה המשולשים חופפים?", OPTS, scen.c, "המשפט המתאים: <b>" + OPTS[scen.c] + "</b>");
  }

  var byTopic = {
    systems: gSystems, percent: gPercent, pythagoras: gPythagoras,
    lineeq: gLineeq, linear: gLinear, elec_power: gElecPower,
    polygons: gPolygons, stats: gStats, congruence: gCongruence
  };
  global.GEN = { byTopic: byTopic, has: function (t) { return !!byTopic[t]; }, make: function (t) { return byTopic[t] ? byTopic[t]() : null; } };
})(window);
