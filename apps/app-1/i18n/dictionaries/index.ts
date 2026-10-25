/**
 * The three assembled locale dictionaries, keyed by code. Server code
 * (`getDictionary`) and the client provider both read from here.
 */

import type { Minhag } from "@repo/hebcal";

import type { Locale } from "../config";
import type { Messages } from "../messages";
import { en } from "./en";
import { yortzeit as enYortzeit } from "./en/yortzeit";
import { fr } from "./fr";
import { yortzeit as frYortzeit } from "./fr/yortzeit";
import { he } from "./he";
import { yortzeit as heYortzeit } from "./he/yortzeit";

const dictionaries: Record<Locale, Messages> = { en, fr, he };

/** Ashkenazi wording ("Yortzeit"), applied over each locale's base tree. */
const ashkenazi: Record<Locale, Messages> = {
  en: enYortzeit(en),
  fr: frYortzeit(fr),
  he: heYortzeit(he),
};

/**
 * The full message tree for one locale, in the profile minhag's wording
 * (Sephardi / unset = "Azkara"). Safe to call server-side.
 */
export function getDictionary(
  locale: Locale,
  minhag?: Minhag | null,
): Messages {
  return (minhag === "ashkenazi" ? ashkenazi : dictionaries)[locale];
}
