# נוסחאות מתמטיות בעברית RTL

הבעיה: דף עברי הוא RTL. נוסחה מתמטית היא LTR. ערבוב לא נכון גורם לנוסחאות להתהפך או להישבר.

## כללי זהב

### 1. עטוף נוסחאות ב-span ייעודי
```html
<span class="formula" dir="ltr">y = 2x − 4</span>
```
ה-`dir="ltr"` מבטיח שהנוסחה לא תתהפך בתוך טקסט עברי.
ה-class מאפשר עיצוב (רקע, צבע, padding) שמבדיל ויזואלית.

### 2. סימנים נכונים (לא ASCII גולמי)

| מושג | נכון | שגוי | הערה |
|------|------|------|------|
| מינוס | `−` (U+2212) | `-` (hyphen) | מינוס אמיתי רחב יותר |
| כפל | `·` (U+00B7) | `*` או `x` | סימן middle dot |
| חזקה² | `x²` (`&sup2;`) או `<sup>2</sup>` | `x^2`, `x**2` | |
| חזקה כללית | `x<sup>n</sup>` | `x^n` | |
| שורש | `√` (U+221A) | `sqrt` | `√25` או `√(a²+b²)` |
| כפול-שווה ≠ | `≠` | `!=` | |
| ≤ ≥ | `≤` `≥` | `<=` `>=` | |
| שבר פשוט בטקסט | `3/4` | — | מקובל |
| שבר מורכב | ראה למטה | — | |

### 3. שברים מורכבים (מונה/מכנה)
בתוך נוסחה פשוטה אפשר `(3y − 2x)/6`. למראה ספרותי יותר אפשר HTML:
```html
<span class="frac"><span class="num">3y − 2x</span><span class="den">6</span></span>
```
עם CSS:
```css
.frac{display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle;}
.frac .num{border-bottom:1.5px solid currentColor;padding:0 4px;}
.frac .den{padding:0 4px;}
```

### 4. סימני < ו-> בתוך HTML
תמיד `&lt;` ו-`&gt;`:
```html
עבור <span class="formula" dir="ltr">x &gt; 2</span> הפונקציה חיובית
```

### 5. זוויות
- מעלות: `65°` (סימן U+00B0)
- זווית: `∠ABC` (U+2220) או פשוט `זווית ABC`
- משולש: `△ABC` (U+25B3)
- חופף: `≅` (U+2245)
- דומה: `∼` (U+223C)
- מקביל: `∥` (U+2225)
- ניצב/מאונך: `⊥` (U+22A5)

### 6. אותיות נקודות וקטעים
- נקודה: `A`, `B` (אות לטינית גדולה)
- קטע: `AB` (שתי אותיות צמודות)
- אורך קטע: `AB = 5 ס"מ`
- זוג סדור: `(2, −4)` — שים לב, בתוך span LTR

## דוגמאות מלאות

```html
<!-- משוואת ישר -->
<p>נתון הישר <span class="formula" dir="ltr">y = 3x − 6</span>.</p>

<!-- מערכת משוואות -->
<p>פתרו את המערכת:
  <span class="formula" dir="ltr">2x + y = 11</span> ,
  <span class="formula" dir="ltr">x − y = 4</span>
</p>

<!-- פיתגורס -->
<p>לפי משפט פיתגורס: 
  <span class="formula" dir="ltr">AE² = AD² + DE² = 24² + 7² = 625</span>,
  ולכן <span class="formula" dir="ltr">AE = √625 = 25</span> ס"מ.
</p>

<!-- אי-שוויון -->
<p>פתרו: <span class="formula" dir="ltr">−2x &gt; −10</span> 
  (שימו לב להיפוך הסימן בחלוקה בשלילי).</p>
```

## CSS בסיסי ל-formula
```css
.formula{
  direction:ltr;
  unicode-bidi:isolate;
  font-family:'Times New Roman', 'Heebo', serif;
  font-weight:600;
  white-space:nowrap;
}
```
`unicode-bidi:isolate` חשוב — הוא מבודד את הנוסחה מהקשר ה-RTL סביבה.
