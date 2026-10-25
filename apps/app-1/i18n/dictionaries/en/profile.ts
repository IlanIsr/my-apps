import type { ProfileTexts } from "@/app/profile/ProfileView";

export const profile = {
  title: "Profile",
  intro: "Your preferences for the app.",
  minhag: {
    title: "Minhag",
    sephardi: "Sephardi",
    ashkenazi: "Ashkenazi",
    hint: "Sephardi: “Azkara”, and Adar II by default in a year with two Adars. Ashkenazi: “Yortzeit”, and Adar I by default.",
  },
  saved: "Saved.",
  error: "Couldn't save. Try again.",
} as const satisfies ProfileTexts;
