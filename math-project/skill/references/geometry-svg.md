# ציורים גיאומטריים — תבניות SVG מוכנות

כל תבנית כתובה כך שתשתלב בדף RTL. ה-SVG עצמו תמיד LTR (כיוון מתמטי תקני).
החלף תוויות (A, B, C) ומספרים לפי הצורך. צבעים מותאמים לרקע בהיר ולרקע כהה (משתני CSS אם רלוונטי, אחרת צבעים ישירים).

עקרון: קווי הצורה בכחול כהה/שחור, נקודות וסימונים בולטים, תוויות בגופן קריא. קווי עזר (גבהים, תיכונים) מקווקווים.

---

## 1. משולש שווה-שוקיים עם תיכון לבסיס

```html
<svg viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg" style="max-width:280px">
  <!-- משולש ABC: A למעלה, B שמאל, C ימין -->
  <polygon points="140,30 50,200 230,200" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <!-- תיכון AD לבסיס -->
  <line x1="140" y1="30" x2="140" y2="200" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="5,4"/>
  <!-- סימון זווית ישרה ב-D -->
  <rect x="132" y="192" width="8" height="8" fill="none" stroke="#7c3aed" stroke-width="1.2"/>
  <!-- סימוני שוקיים שווים (קו קטן על כל שוק) -->
  <line x1="90" y1="110" x2="98" y2="118" stroke="#dc2626" stroke-width="2"/>
  <line x1="182" y1="118" x2="190" y2="110" stroke="#dc2626" stroke-width="2"/>
  <!-- תוויות -->
  <text x="138" y="22" font-size="16" font-weight="bold" fill="#1a1a2e">A</text>
  <text x="36" y="212" font-size="16" font-weight="bold" fill="#1a1a2e">B</text>
  <text x="234" y="212" font-size="16" font-weight="bold" fill="#1a1a2e">C</text>
  <text x="134" y="218" font-size="14" fill="#7c3aed">D</text>
</svg>
```

**שימוש:** שאלות משו"ש, חפיפה דרך תיכון, חישוב זוויות בסיס.
להסרת התיכון (אם לא נדרש): מחק את שורות ה-`<line>` הסגולה וה-`<rect>`.

---

## 2. ריבוע ABCD עם נקודה E על צלע

```html
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" style="max-width:240px">
  <!-- ריבוע: A שמאל-עליון, B ימין-עליון, C ימין-תחתון, D שמאל-תחתון -->
  <rect x="40" y="40" width="160" height="160" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <!-- נקודה E על צלע DC (תחתונה), קרוב ל-C -->
  <circle cx="150" cy="200" r="3" fill="#dc2626"/>
  <!-- אלכסון/קו מ-A ל-E -->
  <line x1="40" y1="40" x2="150" y2="200" stroke="#7c3aed" stroke-width="1.5"/>
  <!-- תוויות פינות -->
  <text x="28" y="36" font-size="15" font-weight="bold" fill="#1a1a2e">A</text>
  <text x="204" y="36" font-size="15" font-weight="bold" fill="#1a1a2e">B</text>
  <text x="204" y="216" font-size="15" font-weight="bold" fill="#1a1a2e">C</text>
  <text x="28" y="216" font-size="15" font-weight="bold" fill="#1a1a2e">D</text>
  <text x="146" y="220" font-size="14" fill="#dc2626">E</text>
</svg>
```

**שימוש:** פיתגורס בריבוע, שטח, חישוב אלכסונים. שים לב לסדר האותיות (נגד כיוון השעון, סטנדרט ישראלי נפוץ A שמאל-עליון).

---

## 3. מערכת צירים עם ישר אחד

```html
<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" style="max-width:260px">
  <!-- צירים -->
  <line x1="20" y1="130" x2="240" y2="130" stroke="#888" stroke-width="1.5"/>
  <line x1="130" y1="20" x2="130" y2="240" stroke="#888" stroke-width="1.5"/>
  <!-- חצי צירים -->
  <polygon points="240,130 232,126 232,134" fill="#888"/>
  <polygon points="130,20 126,28 134,28" fill="#888"/>
  <text x="244" y="134" font-size="13" fill="#888">x</text>
  <text x="120" y="18" font-size="13" fill="#888">y</text>
  <!-- הישר y=2x-4 : חותך x ב-(2,0)→ציור (170,130), חותך y ב-(0,-4)→(130,210) -->
  <line x1="90" y1="290" x2="215" y2="40" stroke="#7c3aed" stroke-width="2.5"/>
  <!-- נקודות חיתוך -->
  <circle cx="170" cy="130" r="3.5" fill="#dc2626"/>
  <circle cx="130" cy="210" r="3.5" fill="#dc2626"/>
  <text x="172" y="124" font-size="12" fill="#dc2626">A</text>
  <text x="112" y="216" font-size="12" fill="#dc2626">B</text>
  <!-- O בראשית -->
  <text x="116" y="126" font-size="12" fill="#555">O</text>
</svg>
```

**שימוש:** שאלות פונקציה קווית + שטח משולש בין הישר לצירים.
**חשוב:** התאם את מיקום הישר ונקודות החיתוך לנתוני השאלה. הציור לעיל הוא דוגמה ל-y=2x−4 (חיתוך x ב-2, חיתוך y ב-−4). אם הנתונים שונים, חשב מחדש את הקואורדינטות במסך.

המרת קואורדינטה מתמטית למסך (בציור הזה, ראשית ב-130,130, סקאלה 20px ליחידה):
- screen_x = 130 + math_x · 20
- screen_y = 130 − math_y · 20

---

## 4. משולש ישר-זווית

```html
<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style="max-width:240px">
  <!-- משולש ישר-זווית: B תחתון-שמאל (הזווית הישרה), C תחתון-ימין, A עליון-שמאל -->
  <polygon points="50,40 50,170 200,170" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <!-- סימון זווית ישרה ב-B -->
  <rect x="50" y="158" width="12" height="12" fill="none" stroke="#1a1a2e" stroke-width="1.2"/>
  <!-- תוויות -->
  <text x="38" y="36" font-size="15" font-weight="bold" fill="#1a1a2e">A</text>
  <text x="36" y="178" font-size="15" font-weight="bold" fill="#1a1a2e">B</text>
  <text x="204" y="178" font-size="15" font-weight="bold" fill="#1a1a2e">C</text>
  <!-- אורכי צלעות (התאם) -->
  <text x="20" y="108" font-size="13" fill="#7c3aed">3</text>
  <text x="120" y="188" font-size="13" fill="#7c3aed">4</text>
  <text x="130" y="100" font-size="13" fill="#dc2626">5</text>
</svg>
```

**שימוש:** משפט פיתגורס בסיסי. החלף את המספרים 3/4/5 לפי השאלה.

---

## 5. שני משולשים חופפים (לשאלות חפיפה)

```html
<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" style="max-width:360px">
  <!-- משולש ABC משמאל -->
  <polygon points="40,40 20,160 130,160" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <text x="32" y="34" font-size="14" font-weight="bold">A</text>
  <text x="8" y="172" font-size="14" font-weight="bold">B</text>
  <text x="130" y="172" font-size="14" font-weight="bold">C</text>
  <!-- משולש DEF מימין -->
  <polygon points="240,40 220,160 330,160" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <text x="232" y="34" font-size="14" font-weight="bold">D</text>
  <text x="208" y="172" font-size="14" font-weight="bold">E</text>
  <text x="330" y="172" font-size="14" font-weight="bold">F</text>
  <!-- סימוני שוויון: צלע אחת בכל משולש עם קו אחד -->
  <line x1="26" y1="100" x2="34" y2="100" stroke="#dc2626" stroke-width="2"/>
  <line x1="226" y1="100" x2="234" y2="100" stroke="#dc2626" stroke-width="2"/>
</svg>
```

**שימוש:** הצגת שני משולשים נפרדים לשאלת חפיפה. הוסף סימוני שוויון (קווים קטנים, קשתות זוויות) לפי הנתונים.

---

## סימונים נפוצים להוספה

**קשת זווית** (לסימון זווית שווה):
```html
<path d="M 60 40 A 20 20 0 0 1 75 55" fill="none" stroke="#16a34a" stroke-width="1.5"/>
```

**סימון שתי זוויות שוות** (קשת כפולה):
```html
<path d="M 60 40 A 18 18 0 0 1 73 53" fill="none" stroke="#16a34a" stroke-width="1.5"/>
<path d="M 60 46 A 14 14 0 0 1 70 56" fill="none" stroke="#16a34a" stroke-width="1.5"/>
```

**סימון שוויון צלעות** (קו אחד / שניים / שלושה רוחביים על הצלע):
```html
<!-- צלע אחת -->
<line x1="95" y1="105" x2="103" y2="113" stroke="#dc2626" stroke-width="2"/>
<!-- שתי צלעות (קו כפול) -->
<line x1="93" y1="107" x2="101" y2="115" stroke="#dc2626" stroke-width="2"/>
<line x1="98" y1="102" x2="106" y2="110" stroke="#dc2626" stroke-width="2"/>
```

## כלל זהב
תמיד ודא שהציור **תואם לנתוני השאלה**: אם השאלה אומרת ∠B=65°, אל תצייר זווית שנראית כמו 30°. אם הריבוע הוא ABCD בסדר מסוים, שמור על הסדר. ילד מסתכל על הציור כדי להבין — ציור שגוי מבלבל יותר מאשר אין ציור.
