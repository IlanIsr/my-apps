import type { GoalCardTexts } from "@/app/components/GoalCard";
import type { GoalModalTexts } from "@/app/components/GoalModal";
import type { GoalsTexts } from "@/app/components/GoalsView";
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
  repayTitle: "להחזיר לחשבון",
  repayHint:
    "שולם בכרטיס מתקציב שנמשך במזומן: יש להחזיר את הסכומים האלה לחשבון.",
  repayAll: "הפקדתי הכול",
  repayOne: "הופקד",
  perLiter: "{liters} ל׳ × {price} לליטר",
  goals: "יעדי החודש",
  seeGoals: "לצפייה",
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
  byAmount: "סכום",
  byLiter: "לפי ליטר",
  liters: "ליטרים",
  pricePerLiter: "מחיר לליטר",
  bySplit: "פירוט",
  itemLabel: "פריט",
  itemAmount: "סכום השורה",
  addItem: "הוספת שורה",
  removeItem: "הסרת השורה",
  badItems: "כל שורה צריכה שם וסכום.",
  toRepay: "להחזיר לחשבון",
  repaidOn: "הוחזר ב־{date}",
} as const satisfies TransactionModalTexts;

export const categories = {
  title: "קטגוריות",
  description:
    "שנו שם או אייקון, קבעו תקציב חודשי (התראה ב־80% ובחריגה) או הסתירו קטגוריה.",
  icon: "אייקון",
  name: "שם",
  budget: "תקציב / חודש",
  noBudget: "ללא",
  cashEnvelope: "נמשך במזומן",
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

export const goals = {
  title: "יעדים",
  description:
    "קבעו כמה לכל היותר להוציא החודש: בסך הכול, לפי קטגוריה או לפי אמצעי תשלום.",
  previous: "החודש הקודם",
  next: "החודש הבא",
  add: "הוספת יעד",
  emptyTitle: "אין יעדים החודש",
  emptyDescription: "הוסיפו יעד, למשל „3,000 ₪ בסך הכול” או „400 ₪ על מסעדות”.",
  copy: "להעתיק את {n} היעדים של {month}",
} as const satisfies GoalsTexts;

export const goalCard = {
  total: "כל ההוצאות",
  spentOf: "{spent} מתוך {amount}",
  remaining: "נשארו {amount}",
  over: "חריגה של {amount}",
  perDay: "כלומר {amount} ליום ({days} ימים נותרו)",
  projection: "≈ {amount} בסוף החודש בקצב הזה",
  projectionOver: "⚠ בקצב הזה: {amount} בסוף החודש, מעל היעד",
  savings: "חיסכון",
  savedOf: "{amount} נחסכו מתוך {target}",
  savingsHow: "מזומן {cash} − יעדי קטגוריות {planned}",
  overPlanned: "⚠ יעדי הקטגוריות חורגים מיעד המזומן ב־{amount}",
  savingsShort: "{amount} פחות מהמתוכנן",
  savingsRepay: "{amount} להחזרה לחשבון (כרטיס), לא נספרים",
} as const satisfies GoalCardTexts;

export const goalModal = {
  addTitle: "יעד חדש",
  editTitle: "עריכת יעד",
  scope: "על",
  scopes: { total: "הכול", category: "קטגוריה", method: "אמצעי תשלום" },
  category: "קטגוריה",
  method: "אמצעי תשלום",
  amount: "מקסימום להוצאה",
  name: "שם (לא חובה)",
  namePlaceholder: "למשל חודש חסכוני",
  save: "שמירה",
  cancel: "ביטול",
  delete: "מחיקה",
  badAmount: "סכום לא תקין.",
} as const satisfies GoalModalTexts;
