import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

const NOT_CONNECTED = "גישה ליומן לא אושרה. התנתקו והתחברו מחדש כדי לאשר.";

export const anniversaryDetail = {
  back: "← כל ימי ההולדת",
  hebDate: "תאריך עברי",
  sharedWith: "משותף עם",
  upcoming: "אירועים קרובים",
  deleteAll: "מחיקת כל האירועים",
  delete: "מחיקה",
  edit: "עריכה",
  viewInCalendar: "פתיחה ביומן Google →",
  deleteConfirm: "למחוק את האירוע הזה?",
  deleteAllConfirm: (name: string) => `למחוק את כל האירועים של ${name}?`,
  error: (message: string) => `משהו השתבש: ${message}`,
  editForm: {
    date: "תאריך",
    time: "שעה (HH:MM)",
    timeHint: "השאירו ריק לצאת הכוכבים",
    shared: "משותף עם (אימיילים, מופרדים בפסיקים)",
    save: "שמירה",
    saving: "שומר…",
    cancel: "ביטול",
    notConnected: NOT_CONNECTED,
  },
} as const satisfies AnniversaryDetailTexts;
