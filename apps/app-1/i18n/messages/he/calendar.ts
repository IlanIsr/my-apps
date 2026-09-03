import type { CalendarMessages } from "../en/calendar";

export const calendar: CalendarMessages = {
  connect: {
    title: "חיבור יומן Google",
    subtitle: "אשרו גישה ליומן כדי ליצור ולנהל אירועי יום הולדת.",
    button: "חיבור יומן Google",
    connected: "מחובר",
    notConnected: "לא מחובר",
    required: "חברו את יומן Google כדי לנהל אירועים.",
    reconnect: "גישה ליומן לא אושרה. התנתקו והתחברו מחדש כדי לאשר.",
  },
  events: {
    title: "אירועי יומן Google",
    none: "אין עדיין אירועים.",
    list: (n) => `אירועים (${n})`,
    date: "תאריך",
    time: "שעה",
    tsetHakohavim: "צאת הכוכבים",
    viewInCalendar: "פתיחה ביומן Google →",
    deleteConfirm: "למחוק את האירוע הזה?",
    deleteAllConfirm: (name) => `למחוק את כל האירועים של ${name}?`,
  },
  actions: {
    create: "יצירת אירועים",
    creating: "יוצר…",
    deleteAll: "מחיקת כל האירועים",
    deleting: "מוחק…",
    delete: "מחיקה",
  },
  eventSummary: (name) => `יום הולדת של ${name}`,
};
