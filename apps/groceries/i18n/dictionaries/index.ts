/**
 * The assembled locale dictionaries, keyed by code. Server code
 * (`getDictionary`) and the client provider both read from here.
 */

import type { Locale } from "../config";
import type { Messages } from "../messages";
import { fr } from "./fr";

const dictionaries: Record<Locale, Messages> = { fr };

/** The full message tree for one locale. Safe to call server-side. */
export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
