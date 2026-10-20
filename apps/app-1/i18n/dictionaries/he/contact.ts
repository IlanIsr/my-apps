import type { ContactFormTexts } from "@/app/contact/ContactForm";

export const contact = {
  title: "יצירת קשר",
  intro:
    "הערה, באג או רעיון? כתבו כאן — ההודעה תגיע אליי ישירות במייל, ואוכל לענות לכם.",
  kind: "סוג",
  kinds: {
    comment: "הערה",
    bug: "באג",
    suggestion: "הצעה",
  },
  message: "הודעה",
  placeholder: "מה תרצו לספר לי?",
  send: "שליחה",
  sending: "שולח…",
  sent: "תודה! ההודעה נשלחה.",
  sendAnother: "שליחת הודעה נוספת",
  errors: {
    empty: "כתבו קודם הודעה.",
    "not-signed-in": "תוקף ההתחברות פג — התחברו שוב.",
    invalid: "לא ניתן לשלוח את ההודעה — בדקו אותה ונסו שוב.",
    "not-configured": "השליחה עדיין לא מוגדרת. נסו שוב מאוחר יותר.",
    failed: "לא ניתן היה לשלוח את ההודעה. נסו שוב.",
  },
} as const satisfies ContactFormTexts;
