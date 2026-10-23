import type { ShareLinkViewTexts } from "@/app/anniversaries/share/[id]/ShareLinkView";

/** Hebrew UI strings — shape: {@link ShareLinkViewTexts}. */
export const shareLinkView = {
  title: "להצטרף לימי ההולדת האלה?",
  intro: "בחרו לאילו להצטרף — תתווספו לכל אחד מהם ותקבלו הזמנה ליומן.",
  expiredTitle: "הקישור הזה פג תוקף",
  expiredBody: "קישורי שיתוף תקפים ל-24 שעות בלבד. בקשו קישור חדש.",
  emptyTitle: "אין למה להצטרף",
  emptyBody: "התאריכים בקישור הזה כבר לא קיימים. בקשו קישור חדש.",
  backToList: "חזרה לרשימה שלי",
  alreadyJoined: "כבר ברשימה שלכם",
  join: "הצטרפות לנבחרים",
  joining: "מצטרף…",
  nothingSelected: "בחרו לפחות יום הולדת אחד.",
  rateLimited: "יומן Google עסוק כרגע — חלק מההזמנות עלולות להתעכב.",
  result: (joined: number, alreadyJoined: number, failed: number) =>
    [
      joined > 0 && `הצטרפתם ל-${joined}`,
      alreadyJoined > 0 && `${alreadyJoined} כבר ברשימה שלכם`,
      failed > 0 && `${failed} נכשלו`,
    ]
      .filter(Boolean)
      .join(" · ") || "אין מה לעשות.",
  error: (message: string) => `משהו השתבש: ${message}`,
} as const satisfies ShareLinkViewTexts;
