/**
 * `@repo/anniversaries` — public API of the anniversary backend.
 *
 * Neon Postgres (Drizzle) is the source of truth; Google Calendar is a sync
 * target. This barrel re-exports only the server-safe orchestration + domain
 * helpers that app-1's server actions consume. **Client components must import
 * from `@repo/anniversaries/person` instead** — the modules below pull
 * server-only DB code (`@neondatabase/serverless`, `drizzle-orm`) that must not
 * reach the browser bundle.
 *
 * Layers: `person.ts` (types + identity helpers) → `store.ts` (persistence) +
 * `calendar.ts` (Google Calendar I/O) → `service.ts` (orchestration).
 */

export {
  type Anniversary,
  type AnniversaryEvent,
  type AnniversaryType,
  normalizeName,
  anniversaryKey,
  formatHebDateLabel,
  occurrencesSince,
} from "./person";

export {
  isCalendarConfigured,
  isAnniversariesAdmin,
  listAnniversaries,
  getAnniversary,
  addAnniversary,
  addMember,
  leaveAnniversary,
  updateEvent,
  updateAnniversary,
  canSyncFromProd,
  syncFromProd,
  NoSuchHebrewDateError,
  CalendarNotConfiguredError,
  CalendarRateLimitError,
  DatabaseNotConfiguredError,
  StoreNotConfiguredError,
  ProdSyncNotConfiguredError,
  type AddAnniversaryInput,
  type AddMemberInput,
  type UpdateEventInput,
  type UpdatePersonInput,
} from "./service";
