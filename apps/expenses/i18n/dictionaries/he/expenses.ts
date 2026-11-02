import type { BilanTexts } from "@/app/components/BilanView";
import type { CategoriesTexts } from "@/app/components/CategoriesView";
import type { ImportTexts } from "@/app/components/ImportView";
import type {
  CategoryNameTexts,
  MethodTexts,
  TransactionModalTexts,
} from "@/app/components/TransactionModal";
import type { TransactionsTexts } from "@/app/components/TransactionsView";

export const methods = {
  cash: "מזומן",
  card: "כרטיס",
  cibus: "סיבוס",
} as const satisfies MethodTexts;

export const categoryNames = {
  groceries: "סופרמרקט",
  restaurant: "מסעדות",
  transport: "תחבורה",
  housing: "דיור",
  health: "בריאות",
  clothing: "ביגוד",
  leisure: "פנאי",
  subscriptions: "מנויים",
  other: "שונות",
} as const satisfies CategoryNameTexts;

export const transactions = {
  title: "הוצאות",
  add: "הוספת הוצאה",
  previous: "החודש הקודם",
  next: "החודש הבא",
  total: "סה״כ החודש",
  allCategories: "כל הקטגוריות",
  allMethods: "כל אמצעי התשלום",
  uncategorized: "ללא קטגוריה",
  emptyTitle: "אין הוצאות",
  emptyDescription:
    "לחצו על „+” בכל תשלום: סכום, קטגוריה, וזהו. לקניות בסופר, הזינו את הקבלה המפורטת.",
  noMatch: "אין הוצאות החודש עם הסינון הזה.",
  receipt: "קבלת סופר",
  importStatement: "ייבוא דף פירוט",
  budgetNear: "{category}: {spent} מתוך {budget} — קרוב לתקציב.",
  budgetOver: "{category}: {spent} מתוך {budget} — חריגה מהתקציב.",
  projection: "≈ {amount} בסוף החודש בקצב הזה",
} as const satisfies TransactionsTexts;

export const transactionModal = {
  addTitle: "הוצאה חדשה",
  editTitle: "עריכת הוצאה",
  amount: "סכום",
  category: "קטגוריה",
  merchant: "איפה",
  merchantPlaceholder: "למשל מאפייה",
  method: "אמצעי תשלום",
  date: "תאריך",
  note: "הערה",
  save: "שמירה",
  cancel: "ביטול",
  delete: "מחיקה",
  badAmount: "יש להזין סכום.",
  fromReceipt: "ההוצאה הזו היא הסכום של קבלת סופר.",
  openReceipt: "לקבלה",
} as const satisfies TransactionModalTexts;

export const categories = {
  title: "קטגוריות",
  description:
    "שנו שם או אייקון, קבעו תקציב חודשי (התראה ב־80% ובחריגה) או הסתירו קטגוריה.",
  icon: "אייקון",
  name: "שם",
  budget: "תקציב / חודש",
  noBudget: "ללא",
  hidden: "מוסתרת",
  save: "שמירה",
  add: "הוספה",
  newName: "קטגוריה חדשה",
} as const satisfies CategoriesTexts;

export const bilan = {
  title: "סיכום",
  emptyTitle: "אין מה לנתח",
  emptyDescription: "הוסיפו הוצאות כדי לראות לאן הולך הכסף.",
  previous: "החודש הקודם",
  next: "החודש הבא",
  total: "סה״כ",
  vsPrevious: "{amount} לעומת החודש הקודם",
  byCategory: "לפי קטגוריה",
  ofBudget: "/ {budget}",
  uncategorized: "ללא קטגוריה",
  methods: "אמצעי תשלום",
  last12: "12 החודשים האחרונים",
  editBudgets: "תקציבים",
} as const satisfies BilanTexts;

export const importTexts = {
  title: "ייבוא דף פירוט",
  description:
    "ייצאו את פירוט הכרטיס כ־CSV או Excel מאתר הבנק ובחרו את הקובץ. שום דבר לא נשלח לפני האישור; שורות שכבר יובאו או הוזנו לא מסומנות.",
  pickFile: "בחירת קובץ",
  unreadable: "לא ניתן לקרוא את הקובץ. נסו ייצוא CSV או Excel (.xlsx).",
  columns: "עמודות",
  date: "תאריך",
  merchant: "בית עסק",
  amount: "סכום",
  none: "—",
  summary: "נקראו {n} שורות ({skipped} דולגו).",
  alreadyImported: "כבר יובאה",
  matches: "כבר הוזנה? ({what})",
  uncategorized: "ללא קטגוריה",
  importButton: "ייבוא {n} שורות",
  done: "יובאו {n} הוצאות.",
} as const satisfies ImportTexts;
