/* ============================================================
   bump-cache.js — מרענן את חותמות ה-cache של נכסים בכל קובצי ה-HTML.
   מוסיף/מעדכן ?v=<sha1 של תוכן הנכס> לכל הפניה מקומית ל-.js/.css.
   כך משתמש חוזר תמיד מקבל את הגרסה העדכנית בלי רענון קשיח — וזה מתעדכן
   רק לקבצים שתוכנם השתנה.

   ⚠️ הרץ זאת לפני כל deploy שבו שונה נכס (.js/.css):
       node bump-cache.js
   (מ-תיקיית exams). מריצים, ואז git add/commit/push כרגיל.
   ============================================================ */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var dir = __dirname;
var hashCache = {};
function hashOf(asset) {
  if (asset in hashCache) return hashCache[asset];
  var h = null;
  try { h = crypto.createHash("sha1").update(fs.readFileSync(path.join(dir, asset))).digest("hex").slice(0, 8); }
  catch (e) { h = null; }
  hashCache[asset] = h; return h;
}
var re = /(\b(?:src|href)=")([^"?:]+\.(?:js|css))(\?v=[^"]*)?(")/g;
var htmls = fs.readdirSync(dir).filter(function (f) { return f.endsWith(".html"); });
var changed = 0, refs = 0;
htmls.forEach(function (file) {
  var p = path.join(dir, file), txt = fs.readFileSync(p, "utf8");
  var out = txt.replace(re, function (m, pre, asset, oldv, post) {
    var h = hashOf(asset);
    if (!h) return m;            // נכס לא קיים — אל תיגע
    refs++;
    return pre + asset + "?v=" + h + post;
  });
  if (out !== txt) { fs.writeFileSync(p, out); changed++; }
});
console.log("files changed: " + changed + ", refs versioned: " + refs);
