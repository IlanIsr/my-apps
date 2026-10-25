import type { ProfileTexts } from "@/app/profile/ProfileView";

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
} as const satisfies ProfileTexts;
