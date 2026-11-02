import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { StatsTexts } from "@/app/components/StatsView";
import type { StoresTexts } from "@/app/components/StoresView";

export const appShell = {
  brand: "קניות",
  language: "שפה",
  menu: "תפריט",
  nav: {
    receipts: "קבלות",
    products: "מוצרים",
    stores: "חנויות",
    shopping: "רשימת קניות",
    stats: "הוצאות",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-found": "לא נמצא.",
  "barcode-taken": "הברקוד הזה כבר משויך למוצר אחר.",
  "not-signed-in": "יש להתחבר קודם.",
  invalid: "נתונים לא תקינים — בדקו את השדות.",
  "db-not-configured": "מסד הנתונים לא מוגדר.",
  unknown: "משהו השתבש. נסו שוב.",
} as const satisfies ErrorTexts;

export const stores = {
  title: "חנויות",
  emptyTitle: "אין חנויות",
  emptyDescription: "חנות נוצרת כשמזינים קבלה.",
  receiptCount: "{n} קבלות",
  lastVisit: "ביקור אחרון {date}",
  products: "מוצרים",
  rename: "שינוי שם",
  save: "שמירה",
  cancel: "ביטול",
} as const satisfies StoresTexts;

export const stats = {
  title: "הוצאות",
  emptyTitle: "אין מה לנתח",
  emptyDescription: "הזינו קבלות כדי לראות לאן הולך הכסף.",
  byMonth: "לפי חודש",
  byStore: "לפי חנות",
  topProducts: "מה עולה הכי הרבה",
  priceRises: "עליות המחיר הגדולות",
  noRises: "לא נמצאו עליות מחיר.",
  receiptCount: "{n} קבלות",
  atStore: "ב{store}",
} as const satisfies StatsTexts;
