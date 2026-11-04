import type { AisleTexts } from "@/app/components/ProductView";
import type { DuplicatesTexts } from "@/app/components/DuplicatesView";
import type { ProductModalTexts } from "@/app/components/ProductModal";
import type { ProductsTexts } from "@/app/components/ProductsView";
import type { ProductTexts } from "@/app/components/ProductView";
import type { ShoppingToggleTexts } from "@/app/components/ShoppingToggle";
import type { ShoppingTexts } from "@/app/components/ShoppingView";

export const products = {
  stores: "חנויות",
  title: "מוצרים",
  search: "שם או ברקוד",
  allStores: "כל החנויות",
  store: "חנות",
  emptyTitle: "אין מוצרים",
  emptyDescription: "המוצרים נוצרים מהקבלות שלך.",
  noMatch: "אין מוצר מתאים.",
  cheapestAt: "הכי זול ב{store}",
  lastBought: "נקנה ב־{date}",
  perKg: "/ק״ג",
  count: "{n} מוצרים",
  aisle: "מחלקה",
  allAisles: "כל המחלקות",
  sort: "מיון",
  sortName: "לפי שם",
  sortMeasure: "מחיר לליטר / לק״ג",
  duplicates: "🔁 כפילויות ({n})",
} as const satisfies ProductsTexts;

export const product = {
  back: "מוצרים",
  compare: "מחיר לפי חנות",
  store: "חנות",
  lastPrice: "מחיר אחרון",
  date: "תאריך",
  cheapest: "הכי זול",
  moreExpensive: "+{pct}%",
  history: "היסטוריה",
  noPrice: "עדיין אין מחיר.",
  perKg: "/ק״ג",
  details: "פרטים",
  edit: "עריכה",
  name: "שם",
  barcode: "ברקוד",
  unit: { unit: "ליחידה", kg: "לפי ק״ג" },
  save: "שמירה",
  cancel: "ביטול",
  range: "שולם בין {min} ל־{max}",
  aisle: "מחלקה",
  noAisle: "—",
  content: "תכולה של יחידה",
  contentHint: "למשל 1.5 ליטר או 0.5 ק״ג — להשוואה לפי ליטר / ק״ג.",
  contentUnits: { l: "ל׳", kg: "ק״ג" },
  badContent: "תכולה לא תקינה.",
} as const satisfies ProductTexts;

export const productModal = {
  add: "הוספת מוצר",
  title: "מוצר חדש",
  friendHint: "כמה מוצרים עם המחירים שלהם?",
  friendReceipt: "קבלה של חבר",
  create: "יצירה",
  cancel: "ביטול",
} as const satisfies ProductModalTexts;

export const shoppingToggle = {
  add: "לרשימה",
  added: "ברשימה",
} as const satisfies ShoppingToggleTexts;

export const shopping = {
  title: "רשימת קניות",
  add: "הוספת מוצר",
  addPlaceholder: "הוספת מוצר…",
  clear: "ניקוי הרשימה",
  emptyTitle: "הרשימה ריקה",
  emptyDescription:
    "הוסיפו מוצרים שכבר קניתם: האפליקציה תגיד באיזו חנות הרשימה יוצאת הכי זולה.",
  quantity: "כמות",
  kg: "ק״ג",
  remove: "הסרה",
  whereTitle: "איפה לקנות?",
  best: "הכי זול",
  missing: "{n} מוצרים בלי מחיר כאן",
  complete: "לכל המוצרים יש מחיר",
  noStores: "עדיין אין חנויות.",
  splitTitle: "בחלוקה בין חנויות",
  splitSaves: "כל מוצר בחנות הזולה ביותר: חיסכון של {amount}.",
  splitNoGain: "אין מה להרוויח מחלוקה: חנות אחת מספיקה.",
  unpriced: "בלי מחיר ידוע: {names}",
} as const satisfies ShoppingTexts;

export const aisles = {
  produce: "פירות וירקות",
  dairy: "מוצרי חלב",
  meat: "בשר",
  fish: "דגים",
  bakery: "מאפים",
  pantry: "מכולת",
  frozen: "קפואים",
  snacks: "חטיפים ומתוקים",
  drinks: "משקאות",
  hygiene: "היגיינה",
  cleaning: "ניקיון",
  household: "לבית",
  other: "אחר",
} as const satisfies AisleTexts;

export const duplicates = {
  back: "מוצרים",
  title: "כפילויות",
  description:
    "למוצרים האלה שמות דומים: האם זה אותו מוצר? שום דבר לא מתמזג בלי אישורכם.",
  emptyTitle: "אין כפילויות",
  emptyDescription: "אין כרגע זוגות מוצרים חשודים.",
  purchases: "{n} רכישות",
  lastPrice: "מחיר אחרון {price}",
  noBarcode: "ללא ברקוד",
  keepName: "לשמור",
  keepBarcode: "ברקוד לשמירה",
  same: "כן, אותו מוצר",
  different: "לא, שונים",
} as const satisfies DuplicatesTexts;
