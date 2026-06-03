/* ============================================================
   license.js — מנעול גישה מרתיע (מקומי, בלי שרת) עם תוקף.
   ⚠️ זהו מנעול מרתיע בלבד, לא הגנה אמיתית: קובץ עצמאי תמיד ניתן
      לעקיפה ע"י מי שיודע לקרוא JS. מתאים לבלימת שיתוף מקרי.
      להגנה אמיתית (ביטול קודים, מעקב) צריך שרת.

   הפעלה בהפצה:
     1) node make-codes.js  → צור קודים אישיים, שלח לכל ילד/ה את הקוד שלו/ה.
     2) הדבק/י את ה-hash-ים ב-codes שלמטה.
     3) שנה/י enabled ל-true.
   כבוי (enabled:false) = המערכת פתוחה לחלוטין (פיתוח/שימוש מקומי).
   ============================================================ */
(function (global) {
  "use strict";

  var LICENSE = {
    enabled: false,                       // ⟵ הפוך ל-true בהפצה
    brand: "תרגול מתמטיקה כיתה ח'",
    // hash(code) → { name, expires }  ·  expires = "YYYY-MM-DD" או null
    codes: {
      // דוגמה בלבד — קוד: MATH-FZQ9-3PXS  (החלף/י בקודים אמיתיים מ-make-codes.js)
      "78a186831dc668bd99da635fc3c1f2777b0ff5792219d4bf629eb4ab007cde4b": { name: "דמו", expires: "2026-12-31" }
    }
  };
  var TOKEN = "mq_license";

  function sha256hex(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
  function isExpired(e) { return e.expires && (new Date(e.expires + "T23:59:59") < new Date()); }
  function lookup(hash) { return LICENSE.codes[hash] || null; }
  function storedValid() {
    try {
      var h = localStorage.getItem(TOKEN); if (!h) return null;
      var e = lookup(h); if (e && !isExpired(e)) return { hash: h, name: e.name, expires: e.expires };
    } catch (x) {}
    return null;
  }
  function applyUser(name) { if (global.MQ && name) { try { global.MQ.setUser(name); } catch (x) {} } }

  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }

  function showGate() {
    var ov = el("div", "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#23201a;background-image:linear-gradient(135deg,#23201a,#0f3a32);font-family:Assistant,Arial,sans-serif;direction:rtl;padding:20px;");
    var card = el("div", "background:#fbfaf6;color:#23201a;max-width:380px;width:100%;border-radius:14px;padding:30px 26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
    card.appendChild(el("div", "font-size:2.4rem;margin-bottom:6px;", "🔒"));
    card.appendChild(el("h2", "font-size:1.3rem;margin-bottom:4px;", LICENSE.brand));
    card.appendChild(el("p", "color:#6d675a;font-size:0.92rem;margin-bottom:18px;", "הזן/הזיני את קוד הגישה האישי שקיבלת."));
    var input = el("input", "width:100%;font-size:1.05rem;letter-spacing:1px;text-align:center;padding:12px;border:2px solid #d9d4c5;border-radius:8px;direction:ltr;text-transform:uppercase;");
    input.placeholder = "MATH-XXXX-XXXX"; input.autocomplete = "off";
    card.appendChild(input);
    var msg = el("div", "min-height:20px;color:#c4453a;font-size:0.86rem;font-weight:700;margin:10px 0;");
    card.appendChild(msg);
    var btn = el("button", "width:100%;background:#0f6e5c;color:#fff;border:none;padding:13px;border-radius:8px;font-family:inherit;font-weight:700;font-size:1rem;cursor:pointer;", "כניסה");
    card.appendChild(btn);
    card.appendChild(el("p", "color:#a8a294;font-size:0.74rem;margin-top:14px;", "אין לך קוד? פנה/י למי ששלח/ה לך את התרגול."));
    ov.appendChild(card); document.body.appendChild(ov);
    input.focus();

    var submit = function () {
      var code = (input.value || "").trim().toUpperCase();
      if (!code) { msg.textContent = "נא להזין קוד"; return; }
      msg.style.color = "#6d675a"; msg.textContent = "בודק…";
      sha256hex(code).then(function (h) {
        var e = lookup(h);
        if (!e) { msg.style.color = "#c4453a"; msg.textContent = "קוד לא תקין"; return; }
        if (isExpired(e)) { msg.style.color = "#c4453a"; msg.textContent = "הקוד פג תוקף (" + e.expires + ")"; return; }
        try { localStorage.setItem(TOKEN, h); } catch (x) {}
        applyUser(e.name);
        location.reload();
      });
    };
    btn.onclick = submit;
    input.addEventListener("keydown", function (ev) { if (ev.key === "Enter") submit(); });
  }

  function init() {
    if (!LICENSE.enabled) return;            // פתוח לחלוטין
    var v = storedValid();
    if (v) { applyUser(v.name); return; }     // כבר מורשה
    try { if (localStorage.getItem(TOKEN)) localStorage.removeItem(TOKEN); } catch (x) {} // פג תוקף/לא תקין
    showGate();
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

  global.MQLicense = { config: LICENSE };
})(window);
