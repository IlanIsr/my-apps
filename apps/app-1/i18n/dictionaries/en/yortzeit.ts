import type { Messages } from "../../messages";
import { ordinal } from "./ordinal";

/**
 * Ashkenazi profile wording: "Yortzeit" instead of "Azkara" in the app's UI.
 * Google Calendar titles (`eventSummary`) are shared by every member of an
 * event, so they keep the neutral wording.
 */
export function yortzeit(m: Messages): Messages {
  const minhag = {
    ...m.anniversaryForm.minhag,
    hint: "In a year with two Adars, the yortzeit falls in Adar II (Sephardi) or Adar I (Ashkenazi).",
  };
  return {
    ...m,
    anniversaries: {
      ...m.anniversaries,
      eyebrow: { ...m.anniversaries.eyebrow, yahrzeit: "Yortzeit" },
      empty: {
        ...m.anniversaries.empty,
        body: "Add a birthday or a yortzeit and it will appear here with its Hebrew date and the next years of occurrences.",
      },
    },
    anniversaryDetail: {
      ...m.anniversaryDetail,
      eyebrow: { ...m.anniversaryDetail.eyebrow, yahrzeit: "Yortzeit" },
      since: (n: number) => `${ordinal(n)} yortzeit`,
      editPersonForm: { ...m.anniversaryDetail.editPersonForm, minhag },
    },
    profile: {
      ...m.profile,
      csvImport: {
        ...m.profile.csvImport,
        types: { ...m.profile.csvImport.types, yahrzeit: "Yortzeit" },
      },
    },
    anniversaryForm: {
      ...m.anniversaryForm,
      minhag,
      types: { ...m.anniversaryForm.types, yahrzeit: "Yortzeit" },
    },
    agenda: { ...m.agenda, since: (n: number) => `${ordinal(n)} yortzeit` },
  };
}
