import type { Locale } from "../config";
import type { Messages } from "../messages";
import { en } from "./en";
import { fr } from "./fr";
import { he } from "./he";

const dictionaries: Record<Locale, Messages> = { en, fr, he };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
