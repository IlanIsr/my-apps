import type { ReceiptFormTexts } from "@/app/components/ReceiptFormView";
import type { ReceiptsTexts } from "@/app/components/ReceiptsView";
import type { ReceiptTexts } from "@/app/components/ReceiptView";

export const receipts = {
  title: "הקבלות שלי",
  add: "קבלה חדשה",
  allStores: "כל החנויות",
  store: "חנות",
  emptyTitle: "אין קבלות",
  emptyDescription:
    "הזינו את הקבלה הראשונה: האפליקציה מחשבת את הסכום כדי לבדוק אותו, ושומרת את המחירים.",
  lineCount: "{n} פריטים",
  matches: "תקין",
  mismatch: "פער",
} as const satisfies ReceiptsTexts;

export const receipt = {
  back: "קבלות",
  edit: "עריכה",
  delete: "מחיקה",
  deleteTitle: "למחוק את הקבלה?",
  deleteDescription: "המחירים שלה לא ייכללו יותר בהשוואות.",
  cancel: "ביטול",
  sum: "סכום מחושב",
  printed: "סה״כ בקבלה",
  difference: "פער {diff}",
  discount: "הנחה",
  matches: "תואם",
  mismatch: "לא תואם",
} as const satisfies ReceiptTexts;

export const receiptForm = {
  newTitle: "קבלה חדשה",
  editTitle: "עריכת קבלה",
  store: "חנות",
  storePlaceholder: "למשל שופרסל",
  date: "תאריך",
  declaredTotal: "סה״כ מודפס",
  note: "הערה",
  lines: "פריטים",
  barcode: "ברקוד",
  label: "שם",
  unit: { unit: "יחידה", kg: "לפי ק״ג" },
  quantity: "כמות",
  weight: "משקל (ק״ג)",
  unitPrice: "מחיר ליחידה",
  pricePerKg: "מחיר לק״ג",
  discount: "הנחה",
  lineTotal: "סה״כ",
  removeLine: "הסרת שורה",
  addLine: "הוספת שורה",
  sum: "סכום",
  printed: "סה״כ בקבלה",
  matches: "תואם",
  mismatch: "פער {diff}",
  noDeclared: "הזינו את הסה״כ לבדיקה",
  method: "אמצעי תשלום",
  save: "שמירה",
  cancel: "ביטול",
  needStore: "יש לציין חנות.",
  badLine: "שורה {n}: שם, כמות או מחיר לא תקינים.",
} as const satisfies ReceiptFormTexts;
