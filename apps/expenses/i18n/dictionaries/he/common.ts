import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { StatsTexts } from "@/app/components/GroceryStats";
import type { StoresTexts } from "@/app/components/StoresView";

export const appShell = {
  brand: "Expenses",
  language: "שפה",
  menu: "תפריט",
  nav: {
    goals: "יעדים",
    expenses: "הוצאות",
    receipts: "קבלות",
    products: "מוצרים",
    shopping: "רשימת קניות",
    stats: "סיכום",
    categories: "קטגוריות",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-found": "לא נמצא.",
  "barcode-taken": "הברקוד הזה כבר משויך למוצר אחר.",
  "not-signed-in": "יש להתחבר קודם.",
  invalid: "נתונים לא תקינים — בדקו את השדות.",
  "db-not-configured": "מסד הנתונים לא מוגדר.",
  unknown: "משהו השתבש. נסו שוב.",
  "photo-unreadable":
    "לא הצלחנו לקרוא את התמונה. נסו תמונה חדה יותר, או הזינו את הקבלה ידנית.",
  "photo-ai-off": "קריאת תמונות עדיין לא הופעלה (Vercel AI Gateway).",
  "photo-limit": "הגעת למגבלת קריאת התמונות לשלב הבדיקה.",
  "photo-busy": "קריאת תמונה כבר מתבצעת.",
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
  title: "קניות בסופר",
  byMonth: "לפי חודש",
  byStore: "לפי חנות",
  topProducts: "מה עולה הכי הרבה",
  priceRises: "עליות המחיר הגדולות",
  noRises: "לא נמצאו עליות מחיר.",
  receiptCount: "{n} קבלות",
  atStore: "ב{store}",
  byAisle: "לפי מחלקה",
  noAisle: "ללא מחלקה",
} as const satisfies StatsTexts;
