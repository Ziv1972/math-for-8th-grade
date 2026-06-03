/* ============================================================
   license.js — מנעול גישה לקודים אישיים. שלושה מצבים (mode):
     "off"    — פתוח לחלוטין (פיתוח/שימוש מקומי). ברירת מחדל.
     "local"  — מנעול מרתיע בלי שרת: קוד מאומת מקומית מול SHA-256 + תוקף.
                ⚠️ ניתן לעקיפה ולא מונע שיתוף קוד בין משתמשים.
     "online" — אימות מול Google Apps Script (ראו apps-script.gs):
                הקוד נקשר למכשיר הראשון; אותו קוד במכשיר אחר נדחה.
                זה מה שבאמת מונע שיתוף. דורש אינטרנט בהפעלה.

   הפעלת מצב online:
     1) פרוס את apps-script.gs (ראו ההוראות שם), העתק את ה-Web app URL.
     2) הדבק ב-endpoint למטה, ושנה mode ל-"online".
   ============================================================ */
(function (global) {
  "use strict";

  var LICENSE = {
    mode: "userpass",                     // "off" | "local" | "online" | "userpass"
    brand: "תרגול במתמטיקה ומדעים · כיתה ח'",
    endpoint: "",                         // online: כתובת ה-Web app של Apps Script
    // userpass — שם משתמש → sha256(סיסמה). הסיסמה עצמה לא נשמרת בקובץ, רק ה-hash.
    users: {
      "demo": "1fc2210b9be582476c36820060ac77f04f6b274bb00b06f0b7b2069dc9a0f99a"  // סיסמה: math2026
    },
    // local בלבד — hash(code) → { name, expires } ; expires="YYYY-MM-DD" או null
    codes: {
      "78a186831dc668bd99da635fc3c1f2777b0ff5792219d4bf629eb4ab007cde4b": { name: "דמו", expires: "2026-12-31" }
    }
  };
  var TOKEN = "mq_license";          // מצב local: ה-hash המאומת
  var OTOKEN = "mq_license_online";  // מצב online: {code,device,name}
  var UTOKEN = "mq_license_user";    // מצב userpass: שם המשתמש המחובר
  var DEVICE = "mq_device";          // מזהה מכשיר אקראי

  function deviceId() {
    try {
      var d = localStorage.getItem(DEVICE);
      if (!d) { d = (global.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("d" + Date.now() + "-" + Math.floor(Math.random() * 1e9)); localStorage.setItem(DEVICE, d); }
      return d;
    } catch (x) { return "nodev"; }
  }
  function sha256hex(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
  function isExpired(e) { return e.expires && (new Date(e.expires + "T23:59:59") < new Date()); }
  function applyUser(name) { if (global.MQ && name) { try { global.MQ.setUser(name); } catch (x) {} } }
  function reasonMsg(reason) {
    return ({ invalid: "קוד לא תקין", expired: "הקוד פג תוקף", another_device: "הקוד כבר בשימוש במכשיר אחר",
      revoked: "הקוד בוטל", network: "אין חיבור לאינטרנט — נסה/י שוב", busy: "השרת עמוס — נסה/י שוב",
      missing: "קוד חסר", badlogin: "שם משתמש או סיסמה שגויים" })[reason] || "שגיאה, נסה/י שוב";
  }

  // ---------- מצב local ----------
  function storedValidLocal() {
    try {
      var h = localStorage.getItem(TOKEN); if (!h) return null;
      var e = LICENSE.codes[h]; if (e && !isExpired(e)) return { name: e.name };
    } catch (x) {}
    return null;
  }
  function validateLocal(code) {
    return sha256hex(code).then(function (h) {
      var e = LICENSE.codes[h];
      if (!e) return { ok: false, reason: "invalid" };
      if (isExpired(e)) return { ok: false, reason: "expired" };
      try { localStorage.setItem(TOKEN, h); } catch (x) {}
      return { ok: true, name: e.name };
    });
  }

  // ---------- מצב userpass (שם משתמש + סיסמה) ----------
  function storedValidUser() {
    try {
      var u = localStorage.getItem(UTOKEN);
      if (u && LICENSE.users && LICENSE.users[u]) return { name: u };
    } catch (x) {}
    return null;
  }
  function validateUserPass(username, password) {
    username = (username || "").trim();
    var stored = LICENSE.users && LICENSE.users[username];
    if (!stored) return Promise.resolve({ ok: false, reason: "badlogin" });
    return sha256hex(password || "").then(function (h) {
      if (h !== stored) return { ok: false, reason: "badlogin" };
      try { localStorage.setItem(UTOKEN, username); } catch (x) {}
      return { ok: true, name: username };
    });
  }

  // ---------- מצב online ----------
  function vUrl(code) {
    return LICENSE.endpoint + (LICENSE.endpoint.indexOf("?") < 0 ? "?" : "&") +
      "action=validate&code=" + encodeURIComponent(code) + "&device=" + encodeURIComponent(deviceId());
  }
  function validateOnline(code) {
    return fetch(vUrl(code)).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok) { try { localStorage.setItem(OTOKEN, JSON.stringify({ code: code, device: deviceId(), name: res.name })); } catch (x) {} }
      return res;
    }).catch(function () { return { ok: false, reason: "network" }; });
  }
  function cachedOnline() { try { var t = JSON.parse(localStorage.getItem(OTOKEN)); if (t && t.code) return t; } catch (x) {} return null; }
  function revalidateOnline() {  // אכיפה ברקע: אם בוטל/מכשיר אחר — נועל מחדש
    var t = cachedOnline(); if (!t) return;
    fetch(vUrl(t.code)).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok === false && res.reason !== "network" && res.reason !== "busy") {
        try { localStorage.removeItem(OTOKEN); } catch (x) {}
        location.reload();
      }
    }).catch(function () {});  // אופליין: ממשיכים עם ה-token השמור
  }

  // ---------- ממשק השער ----------
  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
  function showGate() {
    var userpass = (LICENSE.mode === "userpass");
    var ov = el("div", "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#23201a;background-image:linear-gradient(135deg,#23201a,#0f3a32);font-family:Assistant,Arial,sans-serif;direction:rtl;padding:20px;");
    var card = el("div", "background:#fbfaf6;color:#23201a;max-width:380px;width:100%;border-radius:14px;padding:30px 26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);");
    card.appendChild(el("div", "font-size:2.4rem;margin-bottom:6px;", "🔒"));
    card.appendChild(el("h2", "font-size:1.3rem;margin-bottom:4px;", LICENSE.brand));
    card.appendChild(el("p", "color:#6d675a;font-size:0.92rem;margin-bottom:18px;", userpass ? "הזן/הזיני שם משתמש וסיסמה." : "הזן/הזיני את קוד הגישה האישי שקיבלת."));
    var inStyle = "width:100%;font-size:1.05rem;text-align:center;padding:12px;border:2px solid #d9d4c5;border-radius:8px;margin-bottom:10px;";
    var userIn = null, passIn = null, codeIn = null;
    if (userpass) {
      userIn = el("input", inStyle); userIn.placeholder = "שם משתמש"; userIn.autocomplete = "username"; card.appendChild(userIn);
      passIn = el("input", inStyle); passIn.type = "password"; passIn.placeholder = "סיסמה"; passIn.autocomplete = "current-password"; card.appendChild(passIn);
    } else {
      codeIn = el("input", inStyle + "letter-spacing:1px;direction:ltr;text-transform:uppercase;"); codeIn.placeholder = "MATH-XXXX-XXXX"; codeIn.autocomplete = "off"; card.appendChild(codeIn);
    }
    var msg = el("div", "min-height:20px;color:#c4453a;font-size:0.86rem;font-weight:700;margin:2px 0 10px;"); card.appendChild(msg);
    var btn = el("button", "width:100%;background:#0f6e5c;color:#fff;border:none;padding:13px;border-radius:8px;font-family:inherit;font-weight:700;font-size:1rem;cursor:pointer;", "כניסה"); card.appendChild(btn);
    card.appendChild(el("p", "color:#a8a294;font-size:0.74rem;margin-top:14px;", userpass ? "אין לך פרטי כניסה? פנה/י למי ששלח/ה לך את התרגול." : "אין לך קוד? פנה/י למי ששלח/ה לך את התרגול."));
    ov.appendChild(card); document.body.appendChild(ov); (userpass ? userIn : codeIn).focus();

    var submit = function () {
      var p;
      if (userpass) {
        if (!userIn.value || !passIn.value) { msg.style.color = "#c4453a"; msg.textContent = "נא למלא שם משתמש וסיסמה"; return; }
        msg.style.color = "#6d675a"; msg.textContent = "בודק…"; btn.disabled = true;
        p = validateUserPass(userIn.value, passIn.value);
      } else {
        var code = (codeIn.value || "").trim().toUpperCase();
        if (!code) { msg.style.color = "#c4453a"; msg.textContent = "נא להזין קוד"; return; }
        msg.style.color = "#6d675a"; msg.textContent = "בודק…"; btn.disabled = true;
        p = (LICENSE.mode === "online") ? validateOnline(code) : validateLocal(code);
      }
      p.then(function (res) {
        btn.disabled = false;
        if (res && res.ok) { applyUser(res.name); location.reload(); }
        else { msg.style.color = "#c4453a"; msg.textContent = reasonMsg(res && res.reason); }
      });
    };
    btn.onclick = submit;
    [userIn, passIn, codeIn].forEach(function (i) { if (i) i.addEventListener("keydown", function (ev) { if (ev.key === "Enter") submit(); }); });
  }

  function init() {
    if (LICENSE.mode === "off") return;
    if (LICENSE.mode === "userpass") {
      var u = storedValidUser();
      if (u) { applyUser(u.name); return; }
      showGate(); return;
    }
    if (LICENSE.mode === "online") {
      var t = cachedOnline();
      if (t) { applyUser(t.name); revalidateOnline(); return; }   // טעינה מיידית + אכיפה ברקע
      showGate(); return;
    }
    // local
    var v = storedValidLocal();
    if (v) { applyUser(v.name); return; }
    try { if (localStorage.getItem(TOKEN)) localStorage.removeItem(TOKEN); } catch (x) {}
    showGate();
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

  global.MQLicense = { config: LICENSE, _validateLocal: validateLocal, _validateOnline: validateOnline, _deviceId: deviceId };
})(window);
