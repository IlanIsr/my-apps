import type { ProfileTexts } from "@/app/profile/ProfileView";
import { hebrewMonths } from "./hebrew-months";

export const profile = {
  title: "פרופיל",
  intro: "ההעדפות שלך באפליקציה.",
  minhag: {
    title: "מנהג",
    sephardi: "ספרדי",
    ashkenazi: "אשכנזי",
    hint: "ספרדי: „אזכרה”, ואדר ב׳ כברירת מחדל בשנה מעוברת. אשכנזי: „יארצייט”, ואדר א׳ כברירת מחדל.",
  },
  saved: "נשמר.",
  error: "השמירה נכשלה. נסו שוב.",
  csvImport: {
    title: "ייבוא CSV",
    intro:
      "פורמט נתמך: קובץ ה-CSV של Hebcal ‏(hebcal.com ← Yahrzeit + Anniversary ← CSV). תאריכים dd/mm/yyyy או mm/dd/yyyy. כל אדם נוסף לרשימה שלך; אם הוא כבר קיים, מצטרפים אליו.",
    otherFormat: "הקובץ שלך מגיע ממקום אחר?",
    contact: "צרו קשר",
    contactAfter: " ונטפל בזה.",
    choose: "בחירת קובץ…",
    nothingFound: "לא זוהו תאריכים בקובץ.",
    found: (people: number, skipped: number) =>
      `נמצאו ${people}` + (skipped ? ` · ${skipped} שורות דולגו` : ""),
    type: "סוג",
    types: { birthday: "יום הולדת", yahrzeit: "אזכרה" },
    dates: (n: number) => `${n} תאריכים בקובץ`,
    year: (y: number) => `שנת ${y}`,
    import: (n: number) => `ייבוא (${n})`,
    importing: (done: number, total: number) => `מייבא… ${done}/${total}`,
    status: { created: "נוסף", joined: "כבר קיים — הצטרפת", failed: "נכשל" },
    rateLimited: "יומן Google עמוס — המתינו דקה והפעילו שוב כדי לייבא את השאר.",
    done: (created: number, joined: number, failed: number) =>
      `הסתיים: ${created} נוספו, ${joined} הצטרפת` +
      (failed ? `, ${failed} נכשלו` : "") +
      ".",
    months: hebrewMonths,
  },
  calendarFeed: {
    title: "יומן אפל / Outlook",
    intro:
      "הירשמו לימי השנה שלכם מתוך לוח השנה (iPhone, Mac), Outlook או כל יומן אחר. קריאה בלבד; היומן מתעדכן מעצמו, לפעמים באיחור של כמה שעות. הקישור אישי — אל תשתפו אותו.",
    show: "קבלת הקישור שלי",
    loading: "טוען…",
    subscribe: "הרשמה בלוח השנה",
    otherApps: "יומן אחר (Outlook, Google „מכתובת URL”…): העתיקו את הקישור.",
    copy: "העתקה",
    copied: "הועתק",
    renew: "קישור חדש",
    renewHint: "הקישור הישן יפסיק לעבוד — יהיה צורך להירשם מחדש עם החדש.",
    error: "לא ניתן לקבל את הקישור. נסו שוב.",
    calendarName: "ימי שנה",
  },
} as const satisfies ProfileTexts;
