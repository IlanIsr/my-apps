import type { ExamTexts } from "@/app/components/ExamView";
import type { PrintTexts } from "@/app/components/PrintView";

export const exam = {
  eyebrow: "מבחן",
  title: "בהצלחה",
  questionOf: "שאלה {index} מתוך {total}",
  hint: "התשובות מוצגות בשלב הבדיקה.",
  previous: "הקודמת",
  next: "הבאה",
  finish: "סיום ובדיקה",
  print: "הדפסה",
  jumpTo: "מעבר לשאלה",
  finishConfirm: {
    title: "לסיים את המבחן?",
    description: "נותרו {count} שאלות אחרי זו.",
    cancel: "להמשיך",
    confirm: "סיום ובדיקה",
  },
  correction: {
    eyebrow: "מבחן",
    title: "בדיקה",
    hint: "השוו לתשובה (או למקורות) וסמנו כל שאלה בעצמכם.",
    rated: "{rated}/{total} נבדקו",
    done: "הבדיקה הושלמה",
    result: "התוצאה שלך",
    retry: "חזרה על הטעויות ({count})",
    noRetry: "אין טעויות לחזור עליהן 🎉",
    newExam: "מבחן חדש",
    question: "שאלה {index}",
  },
} as const satisfies ExamTexts;

export const print = {
  back: "חזרה למבחן",
  print: "הדפסה",
  withKey: "מפתח תשובות בסוף",
  withLines: "שורות לתשובה",
  withReferences: "מראי מקום",
  title: "מבחן",
  name: "שם:",
  date: "תאריך:",
  count: "{count} שאלות",
  key: "מפתח תשובות",
} as const satisfies PrintTexts;
