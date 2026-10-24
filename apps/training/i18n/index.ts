/**
 * Training's hand-rolled i18n (same pattern as app-1) (no library). Locale lives in `localStorage`
 * (`training.locale`), read via `useSyncExternalStore`. Every component owns its
 * own `XxxTexts` type and takes a `t` prop — `useTranslations()` is called only
 * at route boundaries and in `AppShell`. Import everything from this barrel
 * (`@/i18n`).
 */

export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_DIR,
  LOCALE_LABEL,
  LOCALE_TAG,
  LOCALES,
  type Locale,
} from "./config";
export { getDictionary } from "./dictionaries";
export { I18nProvider } from "./language-provider";
export { type Messages } from "./messages";
export { useLanguage } from "./use-language";
export { useTranslations } from "./use-translations";
