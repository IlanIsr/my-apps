import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { QuestionBodyTexts } from "@/app/components/QuestionBody";
import type { ResultTexts } from "@/app/components/Results";

export const appShell = {
  brand: "Training",
  language: "שפה",
  nav: {
    questions: "שאלות",
    newExam: "מבחן חדש",
    history: "היסטוריה",
    stats: "סטטיסטיקה",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "פג תוקף החיבור — יש להתחבר מחדש.",
  invalid: "חלק מהפרטים אינם תקינים.",
  "not-found": "לא נמצא — ייתכן שנמחק בינתיים.",
  "empty-exam": "אין שאלות להכניס למבחן הזה.",
  "db-not-configured": "מסד הנתונים אינו מוגדר.",
  unknown: "אירעה שגיאה. נסו שוב.",
} as const satisfies ErrorTexts;

export const results = {
  correct: "נכון",
  partial: "חלקי",
  incorrect: "שגוי",
  unrated: "לא נבדק",
} as const satisfies ResultTexts;

export const questionBody = {
  case: "מקרה",
  letters: "אבגדהוזחטיכלמנסעפצקרשת",
  siman: "סימן",
  seif: "סעיף",
  special: "מיוחדת",
  answer: "תשובה",
  noAnswer: "לא נשמרה תשובה — יש לבדוק לפי המקורות.",
  sources: {
    michnaBroura: "משנה ברורה",
    biourHalaha: "ביאור הלכה",
    kolYaakov: "קול יעקב",
    yeriotChelomo: "יריעות שלמה",
  },
} as const satisfies QuestionBodyTexts;
