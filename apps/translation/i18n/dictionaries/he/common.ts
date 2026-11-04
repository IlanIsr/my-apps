import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { DocSettingsTexts } from "@/app/components/DocSettingsFields";
import type { FileDropTexts } from "@/app/components/FileDrop";
import type { LabelsTexts } from "@/app/components/labels";
import type { ExportTexts } from "@/lib/export-docx";

export const appShell = {
  brand: "סדנת תרגום",
  language: "שפה",
  menu: "תפריט",
  nav: {
    documents: "מסמכים",
    newDocument: "חדש",
    glossary: "מילון מונחים",
    settings: "הגדרות",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "פג תוקף ההתחברות — יש להתחבר מחדש.",
  invalid: "נתונים לא תקינים.",
  "db-not-configured": "מסד הנתונים לא מוגדר (DATABASE_URL).",
  unknown: "שגיאה לא צפויה. נסו שוב.",
  "not-found": "לא נמצא (אולי נמחק בינתיים?).",
  "too-many-pages": "יותר מדי עמודים למסמך אחד (עד 60).",
  "ai-not-configured":
    "Claude לא מוגדר בשרת הזה (המפתח ANTHROPIC_API_KEY חסר או שגוי).",
  "rate-limited": "הגעתם למגבלת השימוש ב-API. המתינו כמה דקות והמשיכו.",
  overloaded: "Claude עמוס כרגע. הריצו את העמוד שוב בעוד רגע.",
  refused: "Claude סירב לעבד את העמוד הזה.",
  "too-large": "העמוד כבד מדי לבקשה אחת.",
  "invalid-reply": "לא ניתן היה לקרוא את התשובה. הריצו את העמוד שוב.",
  "ai-failed": "שגיאה זמנית של Claude. הריצו את העמוד שוב.",
  "no-scan": "הסריקה של העמוד הזה לא נמצאת בדפדפן הזה (המסמך נוצר במכשיר אחר).",
} as const satisfies ErrorTexts;

export const labels = {
  target: { fr: "צרפתית", en: "אנגלית" },
  doctype: {
    auto: "זיהוי אוטומטי",
    civil: "תעודת מרשם אוכלוסין",
    poa: "ייפוי כוח",
    judgment: "פסק דין, החלטה",
    contract: "חוזה",
    succession: "צוואה, ירושה",
    diploma: "תעודה, גיליון ציונים",
    record: "תעודת יושר",
    corporate: "מסמך תאגידי",
    other: "אחר",
  },
  quality: { standard: "רגילה", max: "מרבית (איטית יותר)" },
  origin: {
    "pdf-text": "PDF דיגיטלי (טקסט + תמונה)",
    "pdf-scan": "PDF סרוק",
    photo: "תמונה",
    docx: "Word (טקסט מחולץ)",
  },
  status: {
    idle: "ממתין",
    reading: "קריאה",
    read: "נקרא",
    translating: "תרגום",
    check: "לבדיקה",
    done: "נבדק",
    reviewed: "הוגה",
    error: "נכשל",
  },
  block: {
    title: "כותרת",
    paragraph: "פסקה",
    table: "טבלה",
    stamp: "חותמת",
    signature: "חתימה",
    handwriting: "כתב יד",
    header: "כותרת עליונה",
    footer: "כותרת תחתונה",
    other: "אחר",
  },
} as const satisfies LabelsTexts;

export const docSettings = {
  target: "לתרגם אל",
  doctype: "סוג המסמך",
  quality: "איכות",
  qualityHint: "מרבית: Claude חושב יותר — שימושי לסריקות קשות.",
  highRes: "קריאה ברזולוציה גבוהה",
  highResHint: "שולח כל עמוד גם בשני חצאים, לאותיות קטנות.",
} as const satisfies DocSettingsTexts;

export const fileDrop = {
  title: "גררו לכאן PDF, קובץ Word או תמונות",
  hint: "PDF סרוק או דיגיטלי, Word ‏(.docx), JPEG, PNG, WebP. כמה קבצים = כמה עמודים, לפי סדר הגרירה (אפשר לסדר מחדש). קובץ .doc ישן יש לשמור כ-.docx, ותמונת HEIC לייצא כ-JPEG.",
  busy: "מכין את העמודים…",
} as const satisfies FileDropTexts;

export const exportTexts = {
  unread: "[עמוד שלא נקרא]",
  footer: "{page} / {pages}",
  transcriptionHeading: "תעתיק · עמוד {page} מתוך {pages}",
} as const satisfies ExportTexts;
