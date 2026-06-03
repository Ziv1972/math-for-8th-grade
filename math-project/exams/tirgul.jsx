import React, { useState } from "react";

// ===== עזרי בדיקה =====
const approxEq = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;
const parseNum = (s) => {
  if (s === null || s === undefined) return NaN;
  const cleaned = String(s).trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return NaN;
  // תמיכה בשבר פשוט a/b
  if (cleaned.includes("/")) {
    const [n, d] = cleaned.split("/");
    return Number(n) / Number(d);
  }
  return Number(cleaned);
};

// ===== רכיב תרגיל בודד =====
function Exercise({ q, answer, hint, solution, idx }) {
  const [val, setVal] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "no"
  const [showSol, setShowSol] = useState(false);

  const check = () => {
    const user = parseNum(val);
    if (isNaN(user)) {
      setStatus("no");
      return;
    }
    const answers = Array.isArray(answer) ? answer : [answer];
    const ok = answers.some((a) => approxEq(user, a));
    setStatus(ok ? "ok" : "no");
  };

  return (
    <div className="ex">
      <div className="ex-q">
        <span className="ex-num">{idx}</span>
        <span dangerouslySetInnerHTML={{ __html: q }} />
      </div>
      <div className="ex-row">
        <input
          className={`ex-input ${status === "ok" ? "ok" : status === "no" ? "no" : ""}`}
          value={val}
          onChange={(e) => { setVal(e.target.value); setStatus(null); }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="התשובה שלי"
        />
        <button className="btn-check" onClick={check}>בדיקה</button>
        {status === "ok" && <span className="feedback ok">✓ מצוין!</span>}
        {status === "no" && <span className="feedback no">✗ נסה שוב</span>}
      </div>
      {hint && (
        <details className="hint">
          <summary>רמז</summary>
          <span dangerouslySetInnerHTML={{ __html: hint }} />
        </details>
      )}
      <button className="btn-sol" onClick={() => setShowSol(!showSol)}>
        {showSol ? "הסתר פתרון" : "פתרון מלא"}
      </button>
      {showSol && <div className="solution" dangerouslySetInnerHTML={{ __html: solution }} />}
    </div>
  );
}

// ===== תרגיל בחירה מרובה (לחפיפה / מושגים) =====
function MCQ({ q, options, correct, solution, idx }) {
  const [picked, setPicked] = useState(null);
  const [showSol, setShowSol] = useState(false);
  return (
    <div className="ex">
      <div className="ex-q">
        <span className="ex-num">{idx}</span>
        <span dangerouslySetInnerHTML={{ __html: q }} />
      </div>
      <div className="mcq">
        {options.map((o, i) => (
          <button
            key={i}
            className={`mcq-opt ${picked === i ? (i === correct ? "ok" : "no") : ""} ${picked !== null && i === correct ? "reveal" : ""}`}
            onClick={() => setPicked(i)}
            dangerouslySetInnerHTML={{ __html: o }}
          />
        ))}
      </div>
      {picked !== null && (
        <span className={`feedback ${picked === correct ? "ok" : "no"}`}>
          {picked === correct ? "✓ נכון!" : "✗ לא מדויק"}
        </span>
      )}
      <button className="btn-sol" onClick={() => setShowSol(!showSol)}>
        {showSol ? "הסתר הסבר" : "הסבר"}
      </button>
      {showSol && <div className="solution" dangerouslySetInnerHTML={{ __html: solution }} />}
    </div>
  );
}

// ===== נתוני הפרקים =====
const CHAPTERS = [
  {
    id: "polygons",
    title: "זוויות, שטח והיקף מצולעים",
    icon: "△",
    intro: `
      <p><b>סכום הזוויות במצולע:</b> במשולש סכום הזוויות = 180°. במרובע = 360°. בכל מצולע בעל n צלעות: <b>(n−2)·180°</b>.</p>
      <p><b>משולש שווה-שוקיים:</b> שתי הצלעות (השוקיים) שוות, וגם שתי זוויות הבסיס שוות זו לזו.</p>
      <p><b>שטח והיקף:</b> שטח מלבן = אורך·רוחב. שטח משולש = (בסיס·גובה)/2. היקף = סכום כל הצלעות.</p>
    `,
    type: "num",
    exercises: [
      { q: "במשולש זווית אחת 70° ושנייה 55°. כמה מעלות הזווית השלישית?", answer: 55, hint: "סכום הזוויות במשולש = 180°", solution: "180 − 70 − 55 = <b>55°</b>" },
      { q: "במשולש שווה-שוקיים זווית הראש היא 40°. כמה מעלות כל אחת מזוויות הבסיס?", answer: 70, hint: "זוויות הבסיס שוות זו לזו. (180−40) מתחלק בין שתיהן.", solution: "(180 − 40) ÷ 2 = 140 ÷ 2 = <b>70°</b>" },
      { q: "מלבן באורך 12 ס\"מ ורוחב 5 ס\"מ. מה שטחו (סמ\"ר)?", answer: 60, hint: "שטח מלבן = אורך · רוחב", solution: "12 · 5 = <b>60 סמ\"ר</b>" },
      { q: "מלבן באורך 12 ס\"מ ורוחב 5 ס\"מ. מה היקפו (ס\"מ)?", answer: 34, hint: "היקף = 2·(אורך+רוחב)", solution: "2 · (12 + 5) = 2 · 17 = <b>34 ס\"מ</b>" },
      { q: "משולש בעל בסיס 8 ס\"מ וגובה 6 ס\"מ. מה שטחו (סמ\"ר)?", answer: 24, hint: "שטח משולש = (בסיס · גובה) ÷ 2", solution: "(8 · 6) ÷ 2 = 48 ÷ 2 = <b>24 סמ\"ר</b>" },
      { q: "סכום הזוויות במחומש (5 צלעות) — כמה מעלות?", answer: 540, hint: "(n−2)·180 כאשר n=5", solution: "(5 − 2) · 180 = 3 · 180 = <b>540°</b>" },
    ],
  },
  {
    id: "linear",
    title: "הפונקציה הקווית y = mx + b",
    icon: "📈",
    intro: `
      <p>בפונקציה <b>y = mx + b</b>: <b>m</b> הוא השיפוע, <b>b</b> נקודת החיתוך עם ציר ה-y.</p>
      <p><b>שיפוע m:</b> אם m&gt;0 הפונקציה עולה, אם m&lt;0 יורדת, אם m=0 ישר אופקי (קבוע).</p>
      <p><b>חיתוך עם ציר y:</b> בנקודה (0, b). <b>חיתוך עם ציר x:</b> מציבים y=0 ופותרים.</p>
    `,
    type: "num",
    exercises: [
      { q: "בפונקציה y = 3x − 6, מהו השיפוע?", answer: 3, hint: "השיפוע הוא המקדם של x", solution: "השיפוע הוא המקדם של x, כלומר <b>m = 3</b>" },
      { q: "בפונקציה y = 3x − 6, באיזו נקודה היא חותכת את ציר ה-y? (רשום את ערך ה-y)", answer: -6, hint: "מציבים x=0", solution: "y = 3·0 − 6 = <b>−6</b>. החיתוך בנקודה (0, −6)" },
      { q: "בפונקציה y = 3x − 6, באיזה ערך x היא חותכת את ציר ה-x?", answer: 2, hint: "מציבים y=0 ופותרים את 3x−6=0", solution: "0 = 3x − 6 → 3x = 6 → <b>x = 2</b>" },
      { q: "פונקציה עוברת דרך (0, 4) ויש לה שיפוע 2. מהו ערך b?", answer: 4, hint: "b הוא ערך ה-y כאשר x=0", solution: "החיתוך עם ציר y הוא ב-(0,4), לכן <b>b = 4</b>" },
      { q: "האם הפונקציה y = −5x + 1 עולה או יורדת? (רשום 1 אם עולה, 0 אם יורדת)", answer: 0, hint: "m שלילי → יורדת", solution: "m = −5 &lt; 0, לכן הפונקציה <b>יורדת</b> (תשובה: 0)" },
    ],
  },
  {
    id: "lineeq",
    title: "מציאת משוואת קו ישר",
    icon: "📐",
    intro: `
      <p><b>שיפוע משתי נקודות</b> (x₁,y₁) ו-(x₂,y₂): &nbsp; m = (y₂ − y₁) / (x₂ − x₁).</p>
      <p><b>מציאת המשוואה:</b> מחשבים m, ואז מציבים נקודה אחת לתוך y = mx + b כדי למצוא b.</p>
      <p><b>תחום חיוביות:</b> ערכי x שבהם y&gt;0 (הגרף מעל ציר x). <b>תחום שליליות:</b> y&lt;0 (מתחת לציר x).</p>
    `,
    type: "num",
    exercises: [
      { q: "מהו השיפוע של הישר העובר דרך (1, 2) ו-(3, 8)?", answer: 3, hint: "m = (y₂−y₁)/(x₂−x₁) = (8−2)/(3−1)", solution: "m = (8 − 2) / (3 − 1) = 6 / 2 = <b>3</b>" },
      { q: "ישר עם שיפוע 2 עובר דרך הנקודה (1, 5). מהו ערך b במשוואה y=2x+b?", answer: 3, hint: "הצב x=1, y=5 → 5 = 2·1 + b", solution: "5 = 2·1 + b → 5 = 2 + b → <b>b = 3</b>" },
      { q: "הישר y = 2x − 8 חותך את ציר x ב-x=? (זו תחילת תחום החיוביות)", answer: 4, hint: "y=0 → 2x−8=0", solution: "0 = 2x − 8 → x = 4. עבור x&gt;4 הפונקציה חיובית. נקודת החיתוך: <b>x = 4</b>" },
      { q: "מהו השיפוע של הישר העובר דרך (−2, 3) ו-(2, −5)?", answer: -2, hint: "m = (−5−3)/(2−(−2)) = −8/4", solution: "m = (−5 − 3) / (2 − (−2)) = −8 / 4 = <b>−2</b>" },
    ],
  },
  {
    id: "systems",
    title: "מערכת שתי משוואות בשני נעלמים",
    icon: "⚖️",
    intro: `
      <p>פתרון מערכת = זוג הערכים (x, y) שמקיים את <b>שתי</b> המשוואות יחד.</p>
      <p><b>שיטת ההצבה:</b> מבודדים נעלם אחד ומציבים במשוואה השנייה.</p>
      <p><b>שיטת ההשוואה:</b> מבודדים את אותו נעלם בשתי המשוואות ומשווים.</p>
      <p><b>שיטת החיבור/חיסור:</b> מחברים/מחסירים את המשוואות כדי לבטל נעלם.</p>
    `,
    type: "num",
    exercises: [
      { q: "פתור: x + y = 10 ; x − y = 4. &nbsp; מהו x?", answer: 7, hint: "חבר את שתי המשוואות → 2x = 14", solution: "חיבור: (x+y)+(x−y) = 10+4 → 2x = 14 → <b>x = 7</b> (ואז y = 3)" },
      { q: "פתור: x + y = 10 ; x − y = 4. &nbsp; מהו y?", answer: 3, hint: "אחרי שמצאת x=7, הצב במשוואה הראשונה", solution: "7 + y = 10 → <b>y = 3</b>" },
      { q: "פתור: y = 2x ; x + y = 9. &nbsp; מהו x?", answer: 3, hint: "הצבה: x + 2x = 9", solution: "x + 2x = 9 → 3x = 9 → <b>x = 3</b> (ואז y = 6)" },
      { q: "בעיה: לדינה ולגיא יחד 20 שקלים. לדינה יש פי 3 מגיא. כמה שקלים לגיא?", answer: 5, hint: "נסמן גיא=x, דינה=3x. אז x+3x=20", solution: "x + 3x = 20 → 4x = 20 → x = 5. <b>לגיא 5 ש\"ח</b> (ולדינה 15)" },
      { q: "פתור: 2x + y = 7 ; x = 2. מהו y?", answer: 3, hint: "הצב x=2", solution: "2·2 + y = 7 → 4 + y = 7 → <b>y = 3</b>" },
    ],
  },
  {
    id: "percent",
    title: "אחוזים, משוואות ואי-שוויונות",
    icon: "％",
    intro: `
      <p><b>אחוז מערך:</b> p% מ-X = (p/100)·X. לדוגמה 25% מ-80 = 0.25·80 = 20.</p>
      <p><b>ייקור/הנחה:</b> ייקור ב-p% → כפל ב-(1 + p/100). הנחה ב-p% → כפל ב-(1 − p/100).</p>
      <p><b>אי-שוויון:</b> כשמכפילים/מחלקים בשלילי — <b>הופכים את כיוון האי-שוויון</b>.</p>
    `,
    type: "num",
    exercises: [
      { q: "כמה זה 20% מתוך 150?", answer: 30, hint: "0.20 · 150", solution: "0.20 · 150 = <b>30</b>" },
      { q: "חולצה עלתה 80 ש\"ח וירדה ב-25%. מה המחיר החדש (ש\"ח)?", answer: 60, hint: "80 · (1 − 0.25)", solution: "80 · 0.75 = <b>60 ש\"ח</b>" },
      { q: "מוצר עלה 200 ש\"ח והתייקר ב-10%. מה מחירו החדש (ש\"ח)?", answer: 220, hint: "200 · 1.10", solution: "200 · 1.10 = <b>220 ש\"ח</b>" },
      { q: "30% ממספר מסוים שווה 45. מהו המספר?", answer: 150, hint: "0.30 · X = 45 → X = 45/0.30", solution: "X = 45 / 0.30 = <b>150</b>" },
      { q: "פתור את אי-השוויון: 3x &lt; 21. &nbsp; מהו הערך הגדול ביותר השלם של x שמקיים אותו?", answer: 6, hint: "x &lt; 7, השלם הגדול ביותר", solution: "3x &lt; 21 → x &lt; 7. הערך השלם הגדול ביותר הוא <b>6</b>" },
    ],
  },
  {
    id: "congruence",
    title: "חפיפת משולשים",
    icon: "≅",
    intro: `
      <p>שני משולשים <b>חופפים</b> אם הם זהים לחלוטין בצורה ובגודל. מסמנים △ABC ≅ △DEF.</p>
      <p><b>שלושת משפטי החפיפה:</b></p>
      <ul>
        <li><b>צ.צ.צ (SSS):</b> שלוש צלעות שוות בהתאמה.</li>
        <li><b>צ.ז.צ (SAS):</b> שתי צלעות והזווית הכלואה ביניהן שוות.</li>
        <li><b>ז.צ.ז (ASA):</b> שתי זוויות והצלע שביניהן שוות.</li>
      </ul>
      <p>בהוכחה כותבים <b>טענה</b> ולצדה <b>נימוק</b> (נתון / משפט / תכונה), ובסוף מציינים את משפט החפיפה.</p>
    `,
    type: "mcq",
    exercises: [
      {
        q: "נתון: בשני משולשים שתי צלעות שוות בהתאמה, והזווית <b>שביניהן</b> שווה. איזה משפט חפיפה מתאים?",
        options: ["צ.צ.צ (SSS)", "צ.ז.צ (SAS)", "ז.צ.ז (ASA)"],
        correct: 1,
        solution: "שתי צלעות + הזווית הכלואה ביניהן → <b>צ.ז.צ (SAS)</b>. שים לב: הזווית חייבת להיות <u>בין</u> שתי הצלעות."
      },
      {
        q: "נתון: שלוש הצלעות של משולש אחד שוות בהתאמה לשלוש צלעות של משולש שני. איזה משפט?",
        options: ["צ.צ.צ (SSS)", "צ.ז.צ (SAS)", "ז.צ.ז (ASA)"],
        correct: 0,
        solution: "שלוש צלעות שוות → <b>צ.צ.צ (SSS)</b>."
      },
      {
        q: "נתון: שתי זוויות שוות והצלע <b>שביניהן</b> שווה. איזה משפט?",
        options: ["צ.צ.צ (SSS)", "צ.ז.צ (SAS)", "ז.צ.ז (ASA)"],
        correct: 2,
        solution: "שתי זוויות + הצלע שביניהן → <b>ז.צ.ז (ASA)</b>."
      },
      {
        q: "במשולש שווה-שוקיים מורידים תיכון לבסיס. מהו הנימוק לכך ש-2 השוקיים שוות?",
        options: ["נתון / נתון המשולש שווה-שוקיים", "משפט פיתגורס", "זוויות צמודות"],
        correct: 0,
        solution: "שוויון השוקיים נובע מההגדרה/נתון שהמשולש שווה-שוקיים. זה משמש כ<b>נתון</b> בהוכחה."
      },
    ],
    extraSolution: `
      <div class="proof-example">
        <h4>דוגמה להוכחה מלאה (טענה ונימוק):</h4>
        <p><b>נתון:</b> AB = AC, &nbsp; AD חוצה את זווית A (כלומר ∠BAD = ∠CAD).</p>
        <p><b>צריך להוכיח:</b> △ABD ≅ △ACD.</p>
        <table class="proof-table">
          <tr><th>טענה</th><th>נימוק</th></tr>
          <tr><td>AB = AC</td><td>נתון</td></tr>
          <tr><td>∠BAD = ∠CAD</td><td>נתון (AD חוצה זווית)</td></tr>
          <tr><td>AD = AD</td><td>צלע משותפת</td></tr>
          <tr><td>△ABD ≅ △ACD</td><td>לפי צ.ז.צ (SAS)</td></tr>
        </table>
      </div>
    `,
  },
  {
    id: "pythagoras",
    title: "משפט פיתגורס",
    icon: "📏",
    intro: `
      <p>במשולש <b>ישר-זווית</b>: ריבוע היתר = סכום ריבועי הניצבים.</p>
      <p style="font-size:1.2em;text-align:center"><b>a² + b² = c²</b> &nbsp; (כאשר c הוא היתר — הצלע מול הזווית הישרה).</p>
      <p>למציאת היתר: c = √(a² + b²). למציאת ניצב: a = √(c² − b²).</p>
    `,
    type: "num",
    exercises: [
      { q: "במשולש ישר-זווית הניצבים הם 3 ו-4. מהו היתר?", answer: 5, hint: "c = √(3² + 4²) = √(9+16)", solution: "c = √(9 + 16) = √25 = <b>5</b>" },
      { q: "במשולש ישר-זווית הניצבים הם 6 ו-8. מהו היתר?", answer: 10, hint: "√(36+64) = √100", solution: "c = √(36 + 64) = √100 = <b>10</b>" },
      { q: "במשולש ישר-זווית היתר 13 וניצב אחד 5. מהו הניצב השני?", answer: 12, hint: "a = √(13² − 5²) = √(169−25)", solution: "a = √(169 − 25) = √144 = <b>12</b>" },
      { q: "במשולש ישר-זווית הניצבים שווים ל-5 ו-12. מהו היתר?", answer: 13, hint: "√(25+144)", solution: "c = √(25 + 144) = √169 = <b>13</b>" },
    ],
  },
  {
    id: "stats",
    title: "סטטיסטיקה",
    icon: "📊",
    intro: `
      <p><b>שכיחות:</b> כמה פעמים מופיע ערך. <b>שכיחות יחסית:</b> שכיחות חלקי סך המקרים (לרוב באחוזים).</p>
      <p><b>שכיח:</b> הערך שמופיע הכי הרבה פעמים.</p>
      <p><b>ממוצע:</b> סכום כל הערכים חלקי מספרם.</p>
      <p><b>חציון:</b> הערך האמצעי כשמסדרים את הנתונים בסדר עולה. (אם יש מספר זוגי של ערכים — ממוצע שני האמצעיים.)</p>
    `,
    type: "num",
    exercises: [
      { q: "נתונים: 4, 6, 8, 10, 2. מהו הממוצע?", answer: 6, hint: "(4+6+8+10+2) ÷ 5", solution: "(4+6+8+10+2) ÷ 5 = 30 ÷ 5 = <b>6</b>" },
      { q: "נתונים מסודרים: 3, 5, 7, 9, 11. מהו החציון?", answer: 7, hint: "הערך האמצעי", solution: "5 ערכים, האמצעי הוא השלישי = <b>7</b>" },
      { q: "נתונים: 2, 3, 3, 3, 5, 8. מהו השכיח?", answer: 3, hint: "הערך שחוזר הכי הרבה", solution: "הערך 3 מופיע 3 פעמים — הכי הרבה. השכיח = <b>3</b>" },
      { q: "בכיתה 20 תלמידים, 5 מהם נוסעים באוטובוס. מהי השכיחות היחסית באחוזים?", answer: 25, hint: "5/20 · 100", solution: "(5 ÷ 20) · 100 = <b>25%</b>" },
      { q: "נתונים: 10, 20, 30, 40. מהו החציון? (מספר זוגי של ערכים)", answer: 25, hint: "ממוצע שני הערכים האמצעיים (20 ו-30)", solution: "(20 + 30) ÷ 2 = <b>25</b>" },
    ],
  },
];

export default function App() {
  const [active, setActive] = useState(0);
  const ch = CHAPTERS[active];

  return (
    <div className="wrap" dir="rtl">
      <style>{CSS}</style>

      <header className="hero">
        <div className="hero-badge">מתמטיקה · כיתה ח'</div>
        <h1>תרגול מקיף למבחן — מועד ב'</h1>
        <p className="hero-sub">8 פרקים · הסבר, תרגול ובדיקה אוטומטית · פתרונות מלאים</p>
      </header>

      <nav className="tabs">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            className={`tab ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="tab-icon">{c.icon}</span>
            <span className="tab-num">{i + 1}</span>
            <span className="tab-title">{c.title}</span>
          </button>
        ))}
      </nav>

      <main className="content">
        <div className="ch-head">
          <span className="ch-icon">{ch.icon}</span>
          <h2>{ch.title}</h2>
        </div>

        <section className="intro" dangerouslySetInnerHTML={{ __html: ch.intro }} />

        <h3 className="ex-header">תרגילים</h3>
        <div className="ex-list">
          {ch.exercises.map((e, i) =>
            ch.type === "mcq" ? (
              <MCQ key={i} idx={i + 1} {...e} />
            ) : (
              <Exercise key={i} idx={i + 1} {...e} />
            )
          )}
        </div>

        {ch.extraSolution && (
          <div className="extra-sol" dangerouslySetInnerHTML={{ __html: ch.extraSolution }} />
        )}

        <div className="nav-btns">
          <button
            className="nav-btn"
            disabled={active === 0}
            onClick={() => { setActive(active - 1); window.scrollTo(0, 0); }}
          >
            → הפרק הקודם
          </button>
          <span className="progress">{active + 1} / {CHAPTERS.length}</span>
          <button
            className="nav-btn"
            disabled={active === CHAPTERS.length - 1}
            onClick={() => { setActive(active + 1); window.scrollTo(0, 0); }}
          >
            הפרק הבא ←
          </button>
        </div>
      </main>

      <footer className="foot">בהצלחה במבחן! 💪</footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&family=Secular+One&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.wrap {
  font-family: 'Heebo', sans-serif;
  background: linear-gradient(160deg, #fef6e4 0%, #f3eeff 100%);
  min-height: 100vh;
  color: #1a1a2e;
  padding-bottom: 40px;
}
.hero {
  background: linear-gradient(135deg, #ff6b35 0%, #f7444e 60%, #c73866 100%);
  color: #fff;
  padding: 48px 24px 56px;
  text-align: center;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 10px 30px rgba(199,56,102,0.3);
}
.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.25);
  padding: 6px 18px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 14px;
  backdrop-filter: blur(4px);
}
.hero h1 { font-family: 'Secular One', sans-serif; font-size: 2.1rem; margin-bottom: 10px; }
.hero-sub { opacity: 0.95; font-size: 1rem; }
.tabs {
  display: flex; flex-wrap: wrap; gap: 10px;
  justify-content: center;
  max-width: 1000px; margin: -28px auto 0; padding: 0 16px;
  position: relative; z-index: 2;
}
.tab {
  background: #fff; border: 2px solid transparent;
  border-radius: 16px; padding: 12px 16px;
  cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center;
  min-width: 110px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.tab:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.tab.active { border-color: #ff6b35; background: #fff7f3; }
.tab-icon { font-size: 1.4rem; }
.tab-num {
  background: #ff6b35; color: #fff; width: 22px; height: 22px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; margin: 4px 0;
}
.tab.active .tab-num { background: #c73866; }
.tab-title { font-size: 0.78rem; font-weight: 500; text-align: center; line-height: 1.2; }
.content {
  max-width: 820px; margin: 32px auto 0; padding: 0 20px;
}
.ch-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.ch-icon {
  font-size: 2rem; background: #fff; width: 56px; height: 56px;
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.ch-head h2 { font-family: 'Secular One', sans-serif; font-size: 1.6rem; color: #c73866; }
.intro {
  background: #fff; border-radius: 20px; padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  line-height: 1.8; border-right: 5px solid #ff6b35;
}
.intro p { margin-bottom: 10px; }
.intro ul { margin: 8px 22px; }
.intro li { margin-bottom: 6px; }
.ex-header {
  font-family: 'Secular One', sans-serif;
  margin: 32px 0 16px; font-size: 1.3rem; color: #1a1a2e;
}
.ex-list { display: flex; flex-direction: column; gap: 16px; }
.ex {
  background: #fff; border-radius: 18px; padding: 20px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.05);
}
.ex-q { display: flex; gap: 10px; font-size: 1.05rem; line-height: 1.6; margin-bottom: 14px; }
.ex-num {
  background: #f3eeff; color: #7c3aed; min-width: 28px; height: 28px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; flex-shrink: 0;
}
.ex-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ex-input {
  font-family: 'Heebo'; font-size: 1rem; padding: 10px 14px;
  border: 2px solid #e0e0e0; border-radius: 12px; width: 160px;
  transition: all 0.2s; text-align: center;
}
.ex-input:focus { outline: none; border-color: #7c3aed; }
.ex-input.ok { border-color: #16a34a; background: #f0fdf4; }
.ex-input.no { border-color: #dc2626; background: #fef2f2; }
.btn-check {
  background: #7c3aed; color: #fff; border: none; padding: 10px 22px;
  border-radius: 12px; font-family: 'Heebo'; font-weight: 700; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-check:hover { background: #6d28d9; }
.feedback { font-weight: 700; font-size: 0.95rem; }
.feedback.ok { color: #16a34a; }
.feedback.no { color: #dc2626; }
.hint { margin-top: 12px; }
.hint summary {
  cursor: pointer; color: #ff6b35; font-weight: 500; font-size: 0.9rem;
}
.hint span { display: block; margin-top: 6px; color: #555; font-size: 0.92rem; }
.btn-sol {
  display: block; margin-top: 12px; background: none; border: none;
  color: #7c3aed; font-family: 'Heebo'; font-weight: 700; font-size: 0.9rem;
  cursor: pointer; text-decoration: underline;
}
.solution {
  margin-top: 12px; padding: 14px 16px; background: #f3eeff;
  border-radius: 12px; line-height: 1.7; font-size: 0.95rem;
  border-right: 4px solid #7c3aed;
}
.mcq { display: flex; flex-direction: column; gap: 10px; }
.mcq-opt {
  background: #faf8ff; border: 2px solid #e6e0f5; border-radius: 12px;
  padding: 12px 16px; text-align: right; font-family: 'Heebo'; font-size: 1rem;
  cursor: pointer; transition: all 0.2s;
}
.mcq-opt:hover { border-color: #7c3aed; }
.mcq-opt.ok { border-color: #16a34a; background: #f0fdf4; }
.mcq-opt.no { border-color: #dc2626; background: #fef2f2; }
.mcq-opt.reveal { border-color: #16a34a; }
.extra-sol {
  margin-top: 24px; background: #fff; border-radius: 18px; padding: 22px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.05);
}
.proof-example h4 { color: #c73866; margin-bottom: 12px; font-size: 1.1rem; }
.proof-example p { line-height: 1.7; margin-bottom: 8px; }
.proof-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.proof-table th, .proof-table td {
  border: 1px solid #e0d8f0; padding: 10px 14px; text-align: right;
}
.proof-table th { background: #f3eeff; color: #7c3aed; }
.nav-btns {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 36px; gap: 12px;
}
.nav-btn {
  background: #1a1a2e; color: #fff; border: none; padding: 12px 24px;
  border-radius: 14px; font-family: 'Heebo'; font-weight: 700; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { background: #c73866; }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.progress { font-weight: 700; color: #7c3aed; }
.foot { text-align: center; margin-top: 40px; color: #888; font-weight: 500; }
@media (max-width: 600px) {
  .hero h1 { font-size: 1.5rem; }
  .tab { min-width: 90px; padding: 10px; }
  .tab-title { font-size: 0.68rem; }
}
`;
