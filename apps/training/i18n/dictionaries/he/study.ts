import type { LexiconTexts } from "@/app/components/LexiconView";
import type { NoteFormTexts } from "@/app/components/NoteFormView";
import type { NotesTexts } from "@/app/components/NotesView";
import type { PlanFormTexts } from "@/app/components/PlanFormView";
import type { PlanTexts } from "@/app/components/PlanView";
import type { StudyTexts } from "@/app/components/StudyView";

const passage = {
  masekhet: "מסכת",
  portion: "חלק",
  whole: "כל המסכת",
  custom: "טווח מותאם",
  perek: "פרק",
  from: "מ־",
  to: "עד",
};

export const study = {
  eyebrow: "לימוד",
  title: "תוכניות הלימוד שלי",
  newPlan: "תוכנית חדשה",
  today: "היום",
  next: "השיעור הבא {date}",
  done: "הסתיים",
  progress: "{studied}/{total} עמודים",
  behind: "פיגור של {count} עמודים",
  ahead: "הקדמה של {count} עמודים",
  onTrack: "בזמן",
  empty: {
    title: "אין תוכנית לימוד",
    description:
      "בחר מסכת, קצב וימי לימוד — והאפליקציה תיתן לך תוכנית יום אחר יום.",
  },
} as const satisfies StudyTexts;

export const planForm = {
  eyebrow: "לימוד",
  title: "תוכנית לימוד חדשה",
  subject: "נושא",
  subjects: { gemara: "גמרא" },
  passage,
  rhythm: "קצב",
  byPace: "לפי שיעור",
  byDate: "לפי תאריך סיום",
  pace: "כמות לכל שיעור",
  paceOption: "{amudim} עמודים · {dapim} דף",
  endDate: "תאריך סיום",
  days: "ימי לימוד",
  startDate: "התחלה",
  summaryPace: "{sessions} שיעורים — סיום משוער ב־{end}.",
  summaryDate: "{sessions} שיעורים — כ־{perSession} עמודים לשיעור.",
  summaryTooShort: "אין שיעור לפני תאריך זה.",
  noDays: "בחר לפחות יום אחד.",
  submit: "יצירת התוכנית",
  cancel: "ביטול",
} as const satisfies PlanFormTexts;

export const plan = {
  eyebrow: "תוכנית לימוד",
  back: "התוכניות שלי",
  today: "היום",
  nextSession: "השיעור הבא — {date}",
  nothingToday: "לא נשאר מה ללמוד בתוכנית זו.",
  markAll: "סמן הכל כנלמד",
  writeNote: "כתיבת סיכום",
  lexicon: "מילון",
  endsOn: "סיום משוער ב־{date}",
  catchUp: "יש פיגור: מה שנשאר מתחלק על השיעורים עד תאריך הסיום.",
  shift: "דחיית הסיום ל־{date}",
  coming: "השיעורים הבאים",
  showAll: "הצג הכל ({count})",
  showLess: "הצג פחות",
  byPerek: "לפי פרק",
  perek: "פרק",
  notes: "סיכומים",
  noNotes: "אין עדיין סיכום על קטע זה.",
  editRhythm: "שינוי הקצב",
  delete: "מחיקה",
  rhythm: {
    title: "קצב",
    byPace: "לפי שיעור",
    byDate: "לפי תאריך סיום",
    pace: "כמות לכל שיעור (מהיום)",
    paceOption: "{amudim} עמודים · {dapim} דף",
    endDate: "תאריך סיום",
    days: "ימי לימוד",
    save: "שמירה",
    cancel: "ביטול",
  },
  deleteConfirm: {
    title: "למחוק את התוכנית?",
    description: "ההתקדמות תאבד. הסיכומים נשמרים.",
    cancel: "ביטול",
    confirm: "מחיקה",
  },
} as const satisfies PlanTexts;

export const notes = {
  eyebrow: "לימוד",
  title: "סיכומים",
  newNote: "סיכום חדש",
  search: "חיפוש בסיכומים…",
  untitled: "ללא כותרת",
  noMatch: "אין סיכום מתאים.",
  empty: {
    title: "אין סיכומים",
    description: "כתוב סיכום מתוך השיעור היומי של תוכנית, או על כל קטע שתרצה.",
  },
} as const satisfies NotesTexts;

export const noteForm = {
  eyebrow: "סיכום",
  newTitle: "סיכום חדש",
  editTitle: "סיכום",
  passage,
  title: "כותרת",
  titlePlaceholder: "למשל: זמן קריאת שמע",
  content: "סיכום",
  editor: {
    bold: "מודגש",
    italic: "נטוי",
    underline: "קו תחתון",
    strike: "קו חוצה",
    heading: "כותרת",
    subheading: "כותרת משנה",
    bulletList: "רשימת תבליטים",
    orderedList: "רשימה ממוספרת",
    size: "גודל טקסט",
    sizes: { small: "קטן", normal: "רגיל", large: "גדול", huge: "גדול מאוד" },
    color: "צבע טקסט",
    highlight: "הדגשת רקע",
    none: "ללא",
  },
  save: "שמירה",
  saved: "נשמר",
  backToPlan: "חזרה לתוכנית",
  delete: "מחיקה",
  deleteConfirm: {
    title: "למחוק את הסיכום?",
    description: "הוא יימחק לצמיתות.",
    cancel: "ביטול",
    confirm: "מחיקה",
  },
} as const satisfies NoteFormTexts;

export const lexicon = {
  eyebrow: "מילון",
  title: "מילון",
  terms: "{count} מונחים",
  allAmudim: "כל העמודים ({count})",
  amud: "עמוד",
  search: "חיפוש מונח או תרגום…",
  add: "הוספת מונח",
  addHere: "הוספה",
  edit: "עריכה",
  delete: "מחיקה",
  emptyAmud: "אין מונחים ב־{amud}.",
  noMatch: "אין מונח מתאים.",
  abbreviation: "ר״ת",
  abbreviationsOnly: "ראשי תיבות בלבד",
  abbreviations: {
    link: "כל ראשי התיבות",
    title: "ראשי תיבות",
    description: "כל ראשי התיבות במילון שלך, מכל המסכתות, לפי סדר האלף־בית.",
    empty: "אין עדיין ראשי תיבות — סמן „ראשי תיבות” בעת הוספת מונח.",
  },
  empty: {
    title: "המילון ריק",
    description: "רשום את המילים והביטויים של כל עמוד עם התרגום שלך.",
  },
  form: {
    newTitle: "מונח חדש",
    editTitle: "עריכת מונח",
    term: "מונח",
    termPlaceholder: "למשל: תיובתא",
    translation: "התרגום שלי",
    note: "הערה (לא חובה)",
    isAbbreviation: "ראשי תיבות",
    save: "שמירה",
    saveAndNext: "שמירה והוספת עוד",
    cancel: "ביטול",
  },
  deleteConfirm: {
    title: "למחוק את המונח?",
    cancel: "ביטול",
    confirm: "מחיקה",
  },
} as const satisfies LexiconTexts;
