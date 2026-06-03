/* ============================================================
   make-codes.js — כלי ליצירת קודי גישה אישיים למנעול (license.js).
   הרצה:  node make-codes.js
   ערוך את USERS למטה (שם + תאריך תפוגה), הרץ, ותקבל:
     1) טבלת קודים לחלוקה (שם → קוד) — לשלוח לכל ילד/ה את הקוד שלו/ה.
     2) קטע ה-codes{} להדבקה בתוך license.js (רק ה-hash נשמר — לא הקוד עצמו).
   הקוד עצמו לא נשמר בשום קובץ שמופץ — רק ה-hash. כך הקודים לא גלויים בקובץ.
   ============================================================ */
const crypto = require("crypto");

// >>> ערוך כאן <<<  (expires בפורמט "YYYY-MM-DD", או null ללא תפוגה)
const USERS = [
  { name: "דמו", expires: "2026-12-31" }
];

// אלפבית ללא תווים מבלבלים (0/O, 1/I/L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function randCode() {
  function group() {
    let s = "";
    for (let i = 0; i < 4; i++) s += ALPHABET[crypto.randomBytes(1)[0] % ALPHABET.length];
    return s;
  }
  return "MATH-" + group() + "-" + group();
}
function sha256hex(s) { return crypto.createHash("sha256").update(s, "utf8").digest("hex"); }

const handout = [];
const codesObj = {};
for (const u of USERS) {
  const code = randCode();
  handout.push({ name: u.name, code: code, expires: u.expires });
  codesObj[sha256hex(code)] = { name: u.name, expires: u.expires };
}

console.log("=== קודים לחלוקה (שמור/י בנפרד — לא נכנס לקובץ המופץ) ===");
handout.forEach(h => console.log(`  ${h.name.padEnd(12)} ${h.code}   (תוקף: ${h.expires || "ללא"})`));
console.log("\n=== הדבק/י את זה בתוך codes: { ... } ב-license.js ===");
const lines = Object.keys(codesObj).map(h => `      "${h}": { name: "${codesObj[h].name}", expires: ${codesObj[h].expires ? `"${codesObj[h].expires}"` : "null"} }`);
console.log(lines.join(",\n"));
