import type { GlossaryTexts } from "@/app/components/GlossaryView";
import type { SettingsTexts } from "@/app/components/SettingsView";

export const glossary = {
  eyebrow: "המשרד",
  title: "מילון מונחים",
  intro:
    "תרגומים מחייבים למונח עברי, לפי שפת יעד. כל עמוד שמכיל את המונח מתורגם עם התרגום הזה, ומופיע סימון אם התרגום לא משתמש בו.",
  hebrew: "מונח בעברית",
  rendering: "תרגום מחייב",
  add: "הוספה",
  search: "חיפוש…",
  emptyTitle: "המילון ריק",
  emptyText:
    "הוסיפו מונחים כאן, ייבאו רשימה, או הוסיפו מתוך סימון ״מונח״ בסדנה.",
  noMatch: "אין מונח מתאים.",
  edit: "עריכה",
  save: "שמירה",
  cancel: "ביטול",
  remove: "מחיקה",
  importTitle: "ייבוא רשימה",
  importHint:
    "שורה לכל ערך, בפורמט ״עברית = תרגום״ (גם טאב או נקודה-פסיק עובדים). מונח קיים יוחלף.",
  importButton: "ייבוא",
  imported: "{n} מונחים יובאו.",
  importNothing: "אין שורה בפורמט ״עברית = תרגום״.",
  exportText: "העתקת הרשימה",
  copied: "הרשימה הועתקה ללוח.",
  count: "{n} מונחים",
} as const satisfies GlossaryTexts;

export const settings = {
  eyebrow: "המשרד",
  title: "הגדרות",
  certificationHeading: "אישור",
  certificationIntro:
    "מתווסף בסוף כל תרגום שמיוצא ל-Word, בשפת היעד. {date} מוחלף בתאריך של היום ו-{pages} במספר העמודים.",
  translatorName: "שם המתרגם / הנוטריון",
  translatorNameHint: "מודפס מתחת לאישור.",
  certification: "נוסח האישור",
  certificationPlaceholder: {
    fr: "Je soussigné(e)… certifie que la présente traduction…",
    en: "I, the undersigned… certify that this translation…",
  },
  useTemplate: "להתחיל מתבנית",
  template: {
    fr: "Je soussigné(e), [nom], notaire, certifie que la présente traduction de l'hébreu vers le français, comportant {pages} page(s), est conforme à l'original qui m'a été présenté.\nFait à [ville], le {date}.",
    en: "I, the undersigned, [name], notary, hereby certify that this translation from Hebrew into English, consisting of {pages} page(s), is a true and accurate translation of the original document presented to me.\nDone at [city], on {date}.",
  },
  defaultsHeading: "מסמכים חדשים",
  defaultsIntro: "ההגדרות שמוצעות כברירת מחדל לכל מסמך חדש.",
  save: "שמירה",
  saved: "ההגדרות נשמרו.",
} as const satisfies SettingsTexts;
