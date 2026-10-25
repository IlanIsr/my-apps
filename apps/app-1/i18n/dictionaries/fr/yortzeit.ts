import type { Messages } from "../../messages";

/**
 * Ashkenazi profile wording: "Yortzeit" instead of "Azkara" in the app's UI.
 * Google Calendar titles (`eventSummary`) are shared by every member of an
 * event, so they keep the neutral wording.
 */
export function yortzeit(m: Messages): Messages {
  const minhag = {
    ...m.anniversaryForm.minhag,
    hint: "Les années à deux Adar, la yortzeit tombe en Adar II (séfarade) ou en Adar I (ashkénaze).",
  };
  return {
    ...m,
    anniversaries: {
      ...m.anniversaries,
      eyebrow: { ...m.anniversaries.eyebrow, yahrzeit: "Yortzeit" },
      empty: {
        ...m.anniversaries.empty,
        body: "Ajoutez un anniversaire ou une yortzeit : il apparaîtra ici avec sa date hébraïque et les prochaines années.",
      },
    },
    anniversaryDetail: {
      ...m.anniversaryDetail,
      eyebrow: { ...m.anniversaryDetail.eyebrow, yahrzeit: "Yortzeit" },
      since: (n: number) => `${n}ᵉ yortzeit`,
      editPersonForm: { ...m.anniversaryDetail.editPersonForm, minhag },
    },
    anniversaryForm: {
      ...m.anniversaryForm,
      minhag,
      types: { ...m.anniversaryForm.types, yahrzeit: "Yortzeit" },
    },
    agenda: { ...m.agenda, since: (n: number) => `${n}ᵉ yortzeit` },
  };
}
