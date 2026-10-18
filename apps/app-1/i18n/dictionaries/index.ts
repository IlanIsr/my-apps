/**
 * The three assembled locale dictionaries, keyed by code. Server code
 * (`getDictionary`) and the client provider both read from here.
 */

import type { Locale } from "../config";
import type { Messages } from "../messages";
import { en } from "./en";
import { fr } from "./fr";
import { he } from "./he";

const dictionaries: Record<Locale, Messages> = { en, fr, he };

/** The full message tree for one locale. Safe to call server-side. */
export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
