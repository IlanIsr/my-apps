import type { OnboardingTexts } from "@/app/components/OnboardingModal";

/** Hebrew UI strings — shape: {@link OnboardingTexts}. */
export const onboarding = {
  title: "ברוכים הבאים!",
  intro: "כמה הגדרות מחכות לך בפרופיל:",
  items: [
    {
      title: "עיר",
      text: "האירועים מתחילים בצאת הכוכבים במקום מגוריך (ירושלים כברירת מחדל).",
    },
    {
      title: "מנהג",
      text: "ספרדי או אשכנזי: הניסוח, ואיזה אדר נבחר כברירת מחדל בשנה מעוברת.",
    },
    { title: "יומן Apple / Outlook", text: "קישור להרשמה מכל אפליקציית יומן." },
    { title: "ייבוא CSV", text: "הוספת ימי השנה מייצוא של Hebcal." },
  ],
  openProfile: "לפרופיל שלי",
  later: "אחר כך",
} as const satisfies OnboardingTexts;
