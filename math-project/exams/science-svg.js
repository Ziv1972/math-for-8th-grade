/* ============================================================
   science-svg.js — ספריית שרטוטי SVG סכמטיים למבחני המדעים (חשמל + כוחות).
   נטען לפני ה-EXAM בכל מבחן מדעים; חושף את window.SCI עם מחרוזות SVG מוכנות,
   בסגנון הסמלים שבספר (נורה ⊗, סוללה, מתג, נגד, מד-זרם).
   ============================================================ */
(function (global) {
  "use strict";
  var INK = "#23201a", GREEN = "#0f6e5c", RED = "#c4453a", GOLD = "#b8763e";

  // נורה: עיגול עם X
  function bulb(cx, cy, lit) {
    var col = lit ? GOLD : INK;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + (lit ? "#fff7e6" : "none") + '" stroke="' + col + '" stroke-width="2"/>' +
      '<line x1="' + (cx - 9) + '" y1="' + (cy - 9) + '" x2="' + (cx + 9) + '" y2="' + (cy + 9) + '" stroke="' + col + '" stroke-width="1.5"/>' +
      '<line x1="' + (cx + 9) + '" y1="' + (cy - 9) + '" x2="' + (cx - 9) + '" y2="' + (cy + 9) + '" stroke="' + col + '" stroke-width="1.5"/>';
  }
  // סוללה אנכית (על תיל אופקי) במרכז x=cx, על גובה y: לוח ארוך דק + לוח קצר עבה
  function batteryH(cx, y) {
    return '<line x1="' + (cx + 4) + '" y1="' + (y - 14) + '" x2="' + (cx + 4) + '" y2="' + (y + 14) + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<line x1="' + (cx - 4) + '" y1="' + (y - 8) + '" x2="' + (cx - 4) + '" y2="' + (y + 8) + '" stroke="' + INK + '" stroke-width="5"/>';
  }
  // מתג אנכי (על תיל אנכי) ב-x, בין y1 (תחתון/ציר) ל-y2 (עליון): closed=מחבר
  function switchV(x, yLo, yHi, closed) {
    var s = '<circle cx="' + x + '" cy="' + yLo + '" r="2.6" fill="' + INK + '"/>' +
      '<circle cx="' + x + '" cy="' + yHi + '" r="2.6" fill="' + INK + '"/>';
    if (closed) s += '<line x1="' + x + '" y1="' + yLo + '" x2="' + x + '" y2="' + yHi + '" stroke="' + RED + '" stroke-width="2"/>';
    else s += '<line x1="' + x + '" y1="' + yLo + '" x2="' + (x - 16) + '" y2="' + (yHi + 4) + '" stroke="' + RED + '" stroke-width="2"/>';
    return s;
  }
  function svg(vb, body, maxw) { return '<svg viewBox="' + vb + '" style="max-width:' + (maxw || 220) + 'px">' + body + '</svg>'; }

  // מעגל בסיסי: סוללה (תחתון), נורה (עליון), מתג (ימין). lit/closed לפי הפרמטר.
  function circuit(closed) {
    var wires = '<path d="M50,30 H107 M133,30 H190 M190,30 V58 M190,92 V120 H136 M104,120 H50 V30" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    return svg("0 0 240 150",
      wires + bulb(120, 30, closed) + batteryH(120, 120) + switchV(190, 92, 58, closed));
  }

  // שני נורות בטור (לולאה אחת)
  var SERIES2 = svg("0 0 260 150",
    '<path d="M40,30 H67 M93,30 H147 M173,30 H220 V120 H40 V30" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
    bulb(80, 30, true) + bulb(160, 30, true) + batteryH(130, 120), 240);

  // שני נורות במקביל (שני ענפים)
  var PARALLEL2 = svg("0 0 260 170",
    '<path d="M40,40 H220 M40,40 V140 H220 V40 M110,40 V140 M150,40 V140" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
    // נורות על שני הענפים
    bulb(110, 90, true) + bulb(150, 90, true) +
    // סוללה על התיל התחתון השמאלי
    batteryH(75, 140), 240);

  // זוג כוחות (פעולה ותגובה) — שני חצים מנוגדים
  function forcePair(label1, label2) {
    return svg("0 0 260 120",
      '<rect x="100" y="35" width="60" height="50" rx="4" fill="#f0ece0" stroke="' + INK + '" stroke-width="2"/>' +
      '<line x1="160" y1="60" x2="225" y2="60" stroke="' + RED + '" stroke-width="3"/><polygon points="225,60 215,55 215,65" fill="' + RED + '"/>' +
      '<line x1="100" y1="60" x2="35" y2="60" stroke="' + GREEN + '" stroke-width="3"/><polygon points="35,60 45,55 45,65" fill="' + GREEN + '"/>' +
      '<text x="170" y="28" font-size="11" fill="' + RED + '">' + (label1 || "") + '</text>' +
      '<text x="40" y="28" font-size="11" fill="' + GREEN + '">' + (label2 || "") + '</text>', 250);
  }

  global.SCI = {
    circuitClosed: circuit(true),
    circuitOpen: circuit(false),
    series2: SERIES2,
    parallel2: PARALLEL2,
    forcePair: forcePair,
    bulb: bulb
  };
})(window);
