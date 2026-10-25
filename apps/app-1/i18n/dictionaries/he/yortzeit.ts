import type { Messages } from "../../messages";

/**
 * Ashkenazi profile wording: "יארצייט" instead of "אזכרה" in the app's UI.
 * Google Calendar titles (`eventSummary`) are shared by every member of an
 * event, so they keep the neutral wording.
 */
export function yortzeit(m: Messages): Messages {
  const minhag = {
    ...m.anniversaryForm.minhag,
    hint: "בשנה מעוברת, היארצייט חל באדר ב׳ (ספרדי) או באדר א׳ (אשכנזי).",
  };
  return {
    ...m,
    anniversaries: {
      ...m.anniversaries,
      eyebrow: { ...m.anniversaries.eyebrow, yahrzeit: "יארצייט" },
      empty: {
        ...m.anniversaries.empty,
        body: "הוסיפו יום הולדת או יארצייט, והם יופיעו כאן עם התאריך העברי והשנים הקרובות.",
      },
    },
    anniversaryDetail: {
      ...m.anniversaryDetail,
      eyebrow: { ...m.anniversaryDetail.eyebrow, yahrzeit: "יארצייט" },
      editPersonForm: { ...m.anniversaryDetail.editPersonForm, minhag },
    },
    profile: {
      ...m.profile,
      csvImport: {
        ...m.profile.csvImport,
        types: { ...m.profile.csvImport.types, yahrzeit: "יארצייט" },
      },
    },
    anniversaryForm: {
      ...m.anniversaryForm,
      minhag,
      types: { ...m.anniversaryForm.types, yahrzeit: "יארצייט" },
    },
  };
}
