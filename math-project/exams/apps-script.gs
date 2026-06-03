/* ============================================================
   apps-script.gs — שרת אימות קודים (Google Apps Script + Google Sheet)
   מטרה: למנוע שיתוף קוד בין משתמשים — קוד נקשר למכשיר הראשון שמפעיל אותו,
         וכל ניסיון להשתמש בו במכשיר אחר נדחה. תומך בתפוגה, ביטול, ויומן שימוש.

   ── התקנה (פעם אחת) ─────────────────────────────────────────
   1) צור Google Sheet חדש. בלשונית הראשונה, שורה 1 = כותרות (בדיוק בסדר הזה):
        code | name | expires | status | device | activatedAt | lastSeen
      מלא שורות: code (קוד אישי), name (שם הילד/ה),
      expires ("YYYY-MM-DD" או ריק), status ("active" או "revoked").
      את device/activatedAt/lastSeen השאר ריקים — השרת ימלא.
      (אפשר לייצר קודים עם:  node make-codes.js)
   2) בגיליון: Extensions → Apps Script. מחק את התוכן והדבק את הקובץ הזה. שמור.
   3) Deploy → New deployment → type: Web app.
        Execute as: Me
        Who has access: Anyone
      Deploy → אשר הרשאות → העתק את כתובת ה-Web app URL.
   4) הדבק את ה-URL ב-license.js (endpoint), שנה mode ל-"online", והפץ.
   ── בדיקה: פתח את ה-URL בדפדפן עם ?action=ping → אמור להחזיר {"ok":true,"pong":true}
   ── איפוס מכשיר (אם ילד החליף מחשב/מחק היסטוריה): נקה את תא device באותה שורה.
   ── ביטול קוד: שנה status ל-"revoked".
   ============================================================ */

var SHEET_NAME = ""; // ריק = הלשונית הראשונה

function doGet(e) { return handle(e); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) {}
  return handle({ parameter: p });
}

function handle(e) {
  var a = (e && e.parameter) || {};
  if (a.action === "ping") return json({ ok: true, pong: true });
  if (a.action !== "validate") return json({ ok: false, reason: "bad_action" });

  var code = String(a.code || "").trim();
  var device = String(a.device || "").trim();
  if (!code || !device) return json({ ok: false, reason: "missing" });

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (x) { return json({ ok: false, reason: "busy" }); }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    var data = sh.getDataRange().getValues();
    var head = data[0].map(function (h) { return String(h).trim(); });
    var ci = head.indexOf("code"), ni = head.indexOf("name"), ei = head.indexOf("expires"),
        si = head.indexOf("status"), di = head.indexOf("device"),
        ai = head.indexOf("activatedAt"), li = head.indexOf("lastSeen");

    for (var r = 1; r < data.length; r++) {
      if (String(data[r][ci]).trim() !== code) continue;
      var row = r + 1;
      if (String(data[r][si]).trim().toLowerCase() === "revoked") return json({ ok: false, reason: "revoked" });
      var exp = data[r][ei];
      if (exp) {
        var d = (exp instanceof Date) ? exp : new Date(String(exp) + "T23:59:59");
        if (!isNaN(d) && d < new Date()) return json({ ok: false, reason: "expired" });
      }
      var bound = String(data[r][di] || "").trim();
      if (!bound) {
        sh.getRange(row, di + 1).setValue(device);
        sh.getRange(row, ai + 1).setValue(new Date());
        sh.getRange(row, li + 1).setValue(new Date());
        return json({ ok: true, name: data[r][ni], bound: "new" });
      }
      if (bound === device) {
        sh.getRange(row, li + 1).setValue(new Date());
        return json({ ok: true, name: data[r][ni], bound: "same" });
      }
      return json({ ok: false, reason: "another_device" });
    }
    return json({ ok: false, reason: "invalid" });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
