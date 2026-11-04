import type { DocumentsTexts } from "@/app/components/DocumentsView";
import type { NewDocumentTexts } from "@/app/components/NewDocumentView";

export const documents = {
  eyebrow: "סדנה",
  title: "מסמכים",
  newDocument: "מסמך חדש",
  example: "פתיחת הדוגמה",
  exampleTitle: "דוגמה — ייפוי כוח בדוי",
  emptyTitle: "עדיין אין מסמכים",
  emptyText:
    "העלו מסמך בעברית: Claude קורא, מתעתק ומתרגם כל עמוד, והנקודות לבדיקה מסומנות ליד התרגום. הדוגמה מציגה את התוצאה בלי לשלוח דבר ל-Claude.",
  pages: "{n} עמ׳",
  progress: "{translated}/{pages} תורגמו",
  reviewed: "{reviewed}/{pages} הוגהו",
  privacy:
    "הסריקות נשארות בדפדפן הזה; רק הטקסטים (תעתיק, תרגום, התיקונים שלכם) נשמרים בשרת. כל עמוד נשלח ל-Claude לקריאה. הנוטריון נשאר אחראי לתרגום המאושר: הסימונים מכוונים את ההגהה, הם לא מחליפים אותה.",
} as const satisfies DocumentsTexts;

export const newDocument = {
  eyebrow: "מסמך חדש",
  title: "העלאת מסמך",
  documentTitle: "שם המסמך",
  documentTitlePlaceholder: "למשל: ייפוי כוח ישראלי — מכירה בחולון",
  pagesHeading: "העמודים, לפי הסדר",
  noPages: "העלו לפחות קובץ אחד.",
  ready: "{n} עמודים מוכנים.",
  skipped: "דולג: {files}.",
  truncated: "מוגבל ל-{max} עמודים.",
  nothingReadable:
    "אין עמוד קריא. פורמטים נתמכים: PDF, Word ‏(.docx), JPEG, PNG, WebP.",
  moveUp: "להקדים",
  moveDown: "לאחר",
  rotate: "סיבוב ברבע",
  remove: "הסרה",
  settings: "הגדרות",
  startNow: "להתחיל מיד בקריאה ובתרגום",
  startNowHint: "אחרת, תפעילו את העיבוד מתוך הסדנה.",
  create: "יצירת המסמך",
  creating: "יוצר…",
  cancel: "ביטול",
  privacy:
    "הסריקות נשמרות בדפדפן הזה בלבד. לניסיונות השתמשו במסמכים בדויים או מושחרים.",
} as const satisfies NewDocumentTexts;
