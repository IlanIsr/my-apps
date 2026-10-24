import type { QuestionFormTexts } from "@/app/components/QuestionFormView";
import type { QuestionsTexts } from "@/app/components/QuestionsView";

export const questions = {
  eyebrow: "מאגר",
  title: "שאלות",
  add: "הוספת שאלה",
  search: "חיפוש בשאלות, בתשובות ובמקורות…",
  count: "{count} שאלות",
  filter: {
    label: "סינון",
    all: "הכול",
    special: "מיוחדות",
    normal: "רגילות",
  },
  edit: "עריכה",
  delete: "מחיקה",
  withAnswer: "נשמרה תשובה",
  deleteConfirm: {
    title: "למחוק את השאלה?",
    description: "היא תוסר מהמאגר. מבחנים קודמים שומרים עותק משלהם.",
    cancel: "ביטול",
    confirm: "מחיקה",
  },
  empty: {
    title: "המאגר ריק",
    description: "הוסיפו שאלות ראשונות כדי ליצור מבחן.",
  },
  noMatch: "אין שאלה מתאימה.",
} as const satisfies QuestionsTexts;

export const questionForm = {
  eyebrow: "מאגר",
  newTitle: "שאלה חדשה",
  editTitle: "עריכת שאלה",
  siman: "סימן",
  seif: "סעיף",
  withCase: "להתחיל במקרה",
  casePlaceholder: "תיאור המקרה שהשאלות מתייחסות אליו…",
  prompts: "שאלה / שאלות",
  promptPlaceholder: "נוסח השאלה…",
  addPrompt: "הוספת תת־שאלה",
  removePrompt: "הסרת תת־השאלה",
  withAnswer: "הוספת תשובה",
  answerPlaceholder: "התשובה הצפויה (לכל השאלה)…",
  sources: "מקורות",
  special: "שאלה מיוחדת",
  specialHint: "כדי לבחור אותה (או לדלג עליה) ביצירת מבחן.",
  saveAndNext: "שמירה והמשך",
  save: "שמירה",
  cancel: "ביטול",
  saved: "השאלה נשמרה. הסימן, הסעיף והמקורות נשמרים לשאלה הבאה.",
  promptRequired: "יש לכתוב לפחות שאלה אחת.",
  shortcut: "⌘/Ctrl + Enter לשמירה",
} as const satisfies QuestionFormTexts;
