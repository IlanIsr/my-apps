import type { GenerateTexts } from "@/app/components/GenerateView";
import type { HistoryTexts } from "@/app/components/HistoryView";
import type { StatsTexts } from "@/app/components/StatsView";

export const generate = {
  eyebrow: "מבחן",
  title: "יצירת מבחן",
  bank: "{count} שאלות במאגר",
  filters: "סינון",
  special: {
    label: "שאלות מיוחדות",
    all: "הכול",
    only: "רק מיוחדות",
    without: "בלי",
  },
  history: {
    label: "היסטוריה",
    all: "כל השאלות",
    unseen: "שלא נשאלו",
    incorrect: "תוצאה אחרונה: שגוי",
    partial: "תוצאה אחרונה: חלקי",
  },
  reference: "סימן, סעיף או מקור",
  referencePlaceholder: "לדוגמה 128, משנה ברורה ה…",
  count: "מספר שאלות",
  available: "{count} שאלות מתאימות לסינון",
  take: "להיבחן ({count})",
  print: "גרסה להדפסה",
  noMatch: "אין שאלה שמתאימה לסינון.",
  empty: {
    title: "עדיין אין שאלות",
    description: "מבחן נוצר מתוך מאגר השאלות שלך.",
    add: "הוספת שאלה",
  },
} as const satisfies GenerateTexts;

export const history = {
  eyebrow: "מבחנים",
  title: "היסטוריה",
  newExam: "מבחן חדש",
  count: "{count} שאלות",
  score: "{correct}/{total} נכון",
  retryOf: "חזרה על טעויות",
  status: {
    active: "בתהליך",
    toCorrect: "לבדיקה",
    corrected: "נבדק",
  },
  delete: "מחיקת המבחן",
  deleteConfirm: {
    title: "למחוק את המבחן?",
    description: "התוצאות שלו לא ייכללו עוד בסטטיסטיקה.",
    cancel: "ביטול",
    confirm: "מחיקה",
  },
  empty: {
    title: "אין מבחנים",
    description: "המבחנים שתיצרו יופיעו כאן.",
  },
} as const satisfies HistoryTexts;

export const stats = {
  eyebrow: "התקדמות",
  title: "סטטיסטיקה",
  questions: "שאלות",
  questionsDetail: "{special} מיוחדות · {answers} עם תשובה",
  exams: "מבחנים",
  examsDetail: "{completed} הסתיימו",
  coverage: "כיסוי",
  coverageDetail: "{seen} מתוך {total} כבר נשאלו",
  mastery: "שליטה",
  masteryDetail: "תוצאה אחרונה נכונה",
  latest: "התוצאה האחרונה של כל שאלה",
  review: "לחזרה",
  reviewEmpty: "אין כרגע מה לחזור עליו.",
  edit: "פתיחה",
  empty: {
    title: "אין מה למדוד",
    description: "הוסיפו שאלות והיבחנו.",
  },
} as const satisfies StatsTexts;
