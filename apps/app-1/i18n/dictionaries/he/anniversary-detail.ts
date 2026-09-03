import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

export const anniversaryDetail = {
  back: "כל ימי ההולדת",
  hebDate: "תאריך עברי",
  members: "ברשימה",
  upcoming: "אירועים קרובים",
  edit: "עריכה",
  viewInCalendar: "פתיחה ביומן Google →",
  join: "הוספה לרשימה שלי",
  joining: "מוסיף…",
  leave: "הסרה מהרשימה שלי",
  leaving: "מסיר…",
  leaveConfirm: "להסיר את עצמך מיום הולדת זה?",
  rateLimited: "יומן Google עסוק כרגע — המתינו רגע ונסו שוב.",
  error: (message: string) => `משהו השתבש: ${message}`,
  editForm: {
    date: "תאריך",
    time: "שעה (HH:MM)",
    timeHint: "השאירו ריק לצאת הכוכבים",
    save: "שמירה",
    saving: "שומר…",
    cancel: "ביטול",
    error: (message: string) => `משהו השתבש: ${message}`,
  },
} as const satisfies AnniversaryDetailTexts;
