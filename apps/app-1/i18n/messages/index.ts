import type { Locale } from "../config";
import type { Messages } from "../types";
import { en } from "./en";
import { fr } from "./fr";
import { he } from "./he";

export const MESSAGES: Record<Locale, Messages> = { en, he, fr };
