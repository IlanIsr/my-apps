# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `TECHNICAL_RULES.md` for working preferences (conciseness, scope, styling).

## What this repo is

A personal pnpm + Turborepo monorepo holding **multiple independent web apps** plus shared packages. The apps are not one product and not one Next.js app with many routes — the separation is intentional. Each app is independently deployable, has its own Firebase project and Firestore resources, and will eventually have its own subdomain, while still consuming shared workspace packages.

Apps:

- `app-1` (:3000) — Hebrew-calendar tools. `/` redirects to `/anniversaries`; `/converter` is the **Hebrew Date Converter** (client-side, `@repo/hebcal`).
  - **`/anniversaries`** — a family **Hebrew-anniversary** manager. **Neon Postgres (via Drizzle) is the source of truth; Google Calendar is a sync target.** Each family member is a `persons` row (`id` = preserved text PK — migrated Firestore doc ids stay unchanged, new rows get a `crypto.randomUUID()`; name, `type` = `"birthday" | "yahrzeit"`, hebrewName?, origin?, `hebYear?` = Hebrew year of birth/passing — optional, only drives an age / "Nth yahrzeit" count, never needed to compute occurrences, hebDay/hebMonth, `key` = normalized-name + Hebrew day/month + type for dedup) with `person_members` (lowercased emails) and `person_events` (`year`, `date`, `time`, `google_event_id` — preserved verbatim, `html_link`, `manual`) child tables. A separate `users` table (email PK, `clerk_id`, `has_sent_email`) records everyone who's touched the app or been added to an anniversary, and whether a Google Calendar invite has ever been emailed to that address. Every mutation writes Postgres (multi-table writes go through `db.batch(...)` = one transaction) then `syncPersonEvents()` reconciles that person's calendar events. All events live on **one shared calendar** (`anniversaries.calendar@gmail.com`); the app authenticates AS that account with a stored refresh token (`google-auth-library`). Calendar events link back via `extendedProperties.private.personId` (no JSON blob in the description any more); per-type `colorId` (tangerine birthday / blueberry yahrzeit) and title (`Birthday of X` / `Yahrzeit of X`). All this lives in `@repo/anniversaries`; app-1 only has the route `page.tsx`/`actions.ts` glue (`app/anniversaries/actions.ts`) that adds auth (`getCurrentUserEmail()` / `getCurrentUserId()`) and i18n (`summary`). **Super-user gate:** `ANNIVERSARIES_ADMIN_EMAILS` (comma list in root `.env`, default `anniversaries.calendar@gmail.com`) — a signed-in email in that list sees per-card member counts and the detail "Family on this date" avatar stack; everyone else gets `members: []` from the service (their addresses are never sent to the client). "Add an anniversary" either creates N years of events (eve + tzeit hakochavim, both types) or — if a matching person exists — adds the signed-in user and tops up missing years. Family members are **optional, hidden attendees** (`optional: true`, `guestsCanSeeOtherGuests: false`). The add form (and the per-person "Add someone" / list-wide "Share my list" modal) has a **notify** checkbox (default on): when on, that sync runs `sendUpdates=all` so Google emails each attendee an invite — **accepting the invite is what makes the events show up in a person's own calendar** (a member who has never interacted with the shared calendar sees nothing until they do). When off, a warning says so. `has_sent_email` is recorded per address but doesn't currently gate anything — it's there for a future "don't re-invite" refinement. "Edit details" on the detail page (members / admin) changes name / type / hebrewName / origin / hebYear — a name or type change recomputes `key` and re-syncs the calendar titles (+ colour). "Remove from my list" drops you from `members` (and from the events' attendees) — **the person + events always stay on the shared calendar, even with zero members**. The app never deletes an event; only a manual action on the shared account does (`pnpm --filter @repo/anniversaries clear-calendar`). A member who sets `responseStatus: declined` on the shared calendar (i.e. deletes the invite from their own calendar) is treated the same as leaving — removed from `members`, never re-invited.
  - Per-user Google Calendar scope is **not** used — the app only needs the user's email (`@repo/auth/user` → `getCurrentUserEmail()`) to invite them.
  - `/calendar` is a flat chronological agenda of every upcoming event.
  - Trilingual (en/he/fr).
- `app-2` (:3001) — placeholder (shows `@repo/utils` output). Slated for a Firestore feature.
- `landing` (:3002) — index page linking to the other apps; app list hardcoded in `app/page.tsx` for now, to move to Firestore later.

All three are gated behind Clerk auth — see the Auth section.

All three apps use Tailwind v4 via the shared `@repo/tailwind-config` package: each app's `app/globals.css` is `@import "@repo/tailwind-config";` and has a `postcss.config.mjs` with `@tailwindcss/postcss`. `packages/tailwind-config/styles.css` defines the base palette as CSS vars under `:root` / `.dark` and exposes them via `@theme inline`, so `bg-background` / `text-foreground` follow the active theme. Base light: `#ffe5cc` / `#000000`; dark: `#000000` / `#ffffff`; plus `--color-primary/-secondary/-accent` (placeholders). Dark mode is class-based (`<html class="dark">`); only app-1 toggles it (via `next-themes`) — app-2/landing stay light.

**app-1 overrides the palette locally.** `apps/app-1/app/globals.css` re-declares the full token set (parchment `#F6F0E4` / ink `#241E17` light, warm near-black dark, `--card/-sunken/-hairline/-border(-strong)`, amber `--birthday*` / dusk-blue `--yahrzeit*` accents, `--ornament`, `--destructive`) plus `--radius-pill/-field/-card` and the font tokens, in its own `:root` / `.dark` + `@theme inline` after the import. app-2 / landing keep the shared palette. Fonts are loaded in `apps/app-1/app/layout.tsx` via `next/font/google` — Spectral (Latin serif) + Frank Ruhl Libre (Hebrew serif) stacked as `--font-display` (Spectral has no Hebrew glyphs so Hebrew falls through to Frank Ruhl automatically), Assistant as `--font-sans`, JetBrains Mono as `--font-mono`. Shared primitives for the identity live in `apps/app-1/app/components/`: `Eyebrow` (mono uppercase label + birthday-dot / yahrzeit-diamond marker), `Ornament` (the one decoration: hairline + rotated square), `Segmented` (2–3 option control, replaced the old `Switch`). The favicon is `apps/app-1/app/icon.tsx` — a generated (`next/og`) rotated-square mark on a ground coloured by `VERCEL_ENV` (amber = production, dusk blue = preview/pre-prod, grey = local); non-prod also gets a `[preprod]` / `[dev]` tab-title prefix (set in `layout.tsx` metadata). Keep both in sync if you add an environment.

GitHub: `IlanIsr/my-apps` (branch `main`). `gh` is installed and authenticated as `IlanIsr`; `gh auth setup-git` is configured, so git/gh over HTTPS work without prompting.

Requires Node >= 24 and pnpm 11 (`packageManager` is pinned to `pnpm@11.25.0`).

### Architecture rules to preserve

- Apps are independent and independently buildable/deployable, each with its own backend resources — do not merge them. (app-1 → Vercel + Neon Postgres; app-2 / landing → Firebase, one project per app.)
- Shared code lives in `packages/*`. An app must never import source from another app. A concern used by more than one app becomes a package.
- Don't over-engineer shared packages. In particular **keep `packages/ui` as-is** (mostly the Turborepo starter) — do not redesign or refactor it unless explicitly asked.
- Prefer simple, maintainable solutions. Preserve the working pnpm + Turborepo setup and each app's deployment wiring (Vercel for app-1, Firebase App Hosting for app-2 / landing).

## Commands

Run from the repo root; Turborepo fans tasks out across the workspace.

- `pnpm dev` — run all apps (app-1 :3000, app-2 :3001, landing :3002)
- `pnpm --filter app-1 dev` — run a single app
- `pnpm build` — build all (respects `^build` order)
- `pnpm lint` — ESLint across the workspace (`--max-warnings 0`, so warnings fail)
- `pnpm check-types` — `next typegen && tsc --noEmit` per package
- `pnpm format` — Prettier write over all `.ts/.tsx/.md`

No test runner is configured — there is no `test` task in `turbo.json` or any package.

### Env vars

Next only reads `.env*` from an app's own directory. `@repo/env/load` (imported at the top of every `apps/*/next.config.js`) backfills from a **monorepo-root `.env`** with `override: false` — so shared defaults live in root `.env` (git-ignored; see `.env.example`), and an app's own `apps/<name>/.env.local` overrides them. Production sets vars per deployment (Vercel project env vars for app-1; App Hosting backend for app-2 / landing), which also win (nothing is committed).

## Code architecture

### Shared packages (consumed as raw source, not built)

- `@repo/utils` — plain `.ts`, exports `./src/index.ts` directly. No build step or `dist/`; importers compile it. Editing it is picked up by both apps (and by deployed apps — this was tested).
- `@repo/ui` — React components, exports per-file as `./src/*.tsx` (import as `@repo/ui/button`). Raw source. Starter-quality on purpose; leave it.
- `@repo/tailwind-config` — shared Tailwind v4 base (`styles.css`, exported as `.`). See the styling note above.
- `@repo/auth` — Clerk wiring shared by all apps. Exports `./proxy` (`clerkProxy` handler), `./provider` (`<AuthProvider>`), `./sign-in` (`<SignInView>`), `./nav` (`<AuthControl>`). See the Auth section below.
- `@repo/env` — `./load` (a side-effect JS module) backfills env vars from the root `.env`; imported by each app's `next.config.js`. See the Env vars note.
- `@repo/hebcal` — Hebrew ⇄ Gregorian date logic (wraps `@hebcal/core`). `convert.ts`: `findNextHebrewDate`, `calculateHebrewDate`, `HEBREW_MONTH_KEYS`. `anniversary.ts`: `calculateNextDates` (N future Gregorian dates for a Hebrew day/month, shifted to the eve), `gregorianToHebrew`, `hebrewToGregorian`. `parse.ts`, `zmanim.ts` (`getTsetHakohavim` from hebcal.com). Its own tsconfig uses `moduleResolution: Bundler` so multi-file relative imports need no `.js` extension.
- `@repo/anniversaries` — the anniversary **backend** (portable, storage-agnostic on purpose so it can become a standalone service later). `db/schema.ts` + `db/client.ts`: **Drizzle ORM over Neon Postgres** (`@neondatabase/serverless` `neon-http` driver) — server-only, connection from `DATABASE_URL`, `DatabaseNotConfiguredError` (aliased as `StoreNotConfiguredError` for back-compat) if it's missing. `store.ts`: pure persistence — `listPersons` / `getPerson` / `findByKey` / `createPerson` / `updatePerson` / `deletePerson` / `upsertPerson` / `replaceAllPersons` / `listPersonsFrom(url)`, plus `users` helpers (`upsertUser`, `getEmailSentState`, `markEmailSent`); multi-table writes use `db.batch(...)` (Neon runs it as one transaction). No calendar, auth, or i18n here. `calendar.ts`: Google Calendar sync against the shared bot calendar (`syncPersonEvents`, `patchEvent`, …) — authenticates AS `anniversaries.calendar@gmail.com` via `google-auth-library` + stored refresh token, Calendar REST API via `fetch`. `service.ts`: orchestration — `isCalendarConfigured` (checks `DATABASE_URL` **and** calendar reachability), `isAnniversariesAdmin` (env `ANNIVERSARIES_ADMIN_EMAILS`), `listAnniversaries`, `getAnniversary`, `addAnniversary` (takes `notify`), `addMember` (add one email to an existing person), `updateAnniversary` (edit name/type/hebrewName/origin/hebYear), `leaveAnniversary`, `updateEvent`, `canSyncFromProd` / `syncFromProd` (prod → pre-prod copy, gated on `PROD_DATABASE_URL`), `NoSuchHebrewDateError`. `notify` threads into `syncPersonEvents` as `sendUpdates=all` vs `none`. `person.ts`: `Anniversary`/`AnniversaryEvent`/`AnniversaryType` types + identity helpers (`normalizeName`, `anniversaryKey`, `formatHebDateLabel`, `occurrencesSince`). **`person.ts` is a client-safe subpath export** (`@repo/anniversaries/person`) — client components import from there, never from `.` (the index pulls server-only DB code into the browser bundle otherwise). **Drizzle**: `drizzle.config.ts` (loads `DATABASE_URL` from the repo-root `.env`/`.env.local` itself, via `dotenv`) + `drizzle/` SQL migrations; `pnpm --filter @repo/anniversaries db:generate` (offline, after a schema change) / `db:migrate` (apply) / `db:push` / `db:studio`. **app-1's `build` script runs `db:migrate` before `next build`**, so every Vercel deploy applies its own environment's pending migrations automatically (a dev running `pnpm build` locally therefore needs a reachable `DATABASE_URL`). `scripts/`: `migrate-firestore-to-neon.ts` + `verify-migration.ts` (one-time prod-Firestore → Neon import, see the Firebase section), `clear-calendar.ts` / `delete-person.ts` (calendar/store maintenance), `migrate-to-firestore.ts` (deprecated, historical). **`firebase-admin` is a devDependency** — only the migration/verify scripts touch it; nothing under `src/` imports Firebase. Depends on `@repo/hebcal`. Callers pass the signed-in user's email + Clerk id + a pre-translated event `summary` — the package does no auth or i18n. Same `moduleResolution: Bundler` setup as `@repo/hebcal`.
- `@repo/eslint-config` — flat-config presets `./base`, `./next-js`, `./react-internal`. `base.js` includes `eslint-config-prettier`, `typescript-eslint`, `eslint-plugin-turbo`, and `eslint-plugin-only-warn` (downgrades every rule to a warning — combined with the apps' `--max-warnings 0`, warnings still block).
- `@repo/typescript-config` — `base.json`, `nextjs.json`, `react-library.json`. Base is strict with `noUncheckedIndexedAccess` and `NodeNext` resolution.

Apps consume these via `workspace:*`. Changes to a package are seen directly by apps (no rebuild), but `pnpm build` / `check-types` still re-runs because Turbo caches per-package.

### Toolchain notes

- TypeScript `7.0.2` (native compiler) across apps and packages. `@repo/eslint-config` additionally aliases `typescript` to `npm:@typescript/typescript6@6.0.2` for `typescript-eslint` compatibility.
- ESLint 10 flat config only. Each app's `eslint.config.js` just re-exports `nextJsConfig` from `@repo/eslint-config/next-js`. Note `eslint-plugin-react-hooks` v7 flags the `useEffect(() => setMounted(true))` mount pattern — drive theme-dependent rendering off the `.dark` class in CSS instead.
- All apps: Next.js 16 App Router, React 19, `"type": "module"`, root `app/` dir. app-1 also has `lib/` and `i18n/` dirs and a `@/*` → `./*` tsconfig path alias (app-2/landing are too small to need one).

### app-1 i18n (component-owned text types)

Hand-rolled, no library, pattern borrowed from the `exam_training` repo. **Every component exports its own `XxxTexts` type and takes a `t: XxxTexts` prop — no component calls `useTranslations()`.** It's called only in: `page.tsx` files that are client components (`/converter`, `/anniversaries/new`); a per-route client boundary (`AnniversariesView`, `AnniversaryDetailView`, `AgendaView`) that the server `page.tsx` renders _after_ its Google-Calendar fetch; and `Navbar` (the shell). Those provide the `t` slices to the feature components. `i18n/messages.ts` assembles the `Messages` type by importing every component's `XxxTexts`; each `i18n/dictionaries/<locale>/<feature>.ts` does `export const x = {…} as const satisfies XxxTexts`, and `<locale>/index.ts` does `satisfies Messages`.

- `i18n/`: `config.ts` (locales `en`/`he`/`fr`, dir, `Intl` tags), `language-context.ts` / `language-provider.tsx` (`I18nProvider`), `use-language.ts` (`useLanguage()` → `{ locale, dir, setLocale }`), `use-translations.ts` (`useTranslations()` → `Messages`), `index.ts` (barrel — import from `@/i18n`), `dictionaries/<locale>/*`.
- Locale is persisted in `localStorage` (`app-1.locale`), read via `useSyncExternalStore` (falls back to `navigator.language`, then `en`). An inline script in `layout.tsx` sets `<html lang/dir>` before paint — **keep its storage key + locale list in sync with `config.ts`**.
- Gregorian month names come from `Intl.DateTimeFormat`, not the dictionaries. The event-title text lives in `lib/event-summary.ts` (`EventSummaryTexts` = `{ birthday(name), yahrzeit(name) }`) so server actions can use it via `getDictionary(locale)`.
- **Add a UI string**: add it to the owning component's `XxxTexts` type, then to that feature's file in all three `dictionaries/<locale>/`.

## Auth (Clerk)

All three apps are **fully gated** — every route redirects to `/sign-in` without a session — via **one shared Clerk instance** (same keys everywhere), so a session on one app carries to the others.

- **Cross-app SSO**: Clerk shares sessions across subdomains automatically and across `localhost` ports, so it works in local dev today. In production it only works once the apps are on subdomains of one domain (`*.ilanisr.is-a.dev`) — on the current `*.hosted.app` URLs each app is an isolated site and sessions won't carry. No satellite-domain config needed; just point all apps at the same Clerk **production** instance once the domains are live.
- **Wiring per app**: `proxy.ts` (Next 16's renamed middleware — re-exports `clerkProxy`, but `config.matcher` must be a literal in the file), `<AuthProvider>` in the root layout, `<AuthControl>` in the header, `app/sign-in/[[...sign-in]]/page.tsx` rendering `<SignInView>`.
- **`@clerk/nextjs` is v7 / "Core 3"** (March 2026): `<SignedIn>`/`<SignedOut>`/`<Protect>` are gone — use `<Show when="signed-in">`. `createRouteMatcher` is deprecated. The proxy does a plain `auth()` + `NextResponse.redirect` instead.
- Social-only (Google + Apple) is configured in the Clerk dashboard, not code.
- **Keys**: put `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in the root `.env` (see env note below). For app-1 production they're Vercel project env vars (both environments); for app-2 / landing production they're in `apps/<name>/apphosting.yaml`. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` missing at build → `@clerk/nextjs: Missing publishableKey` → every gated route 500s.

### app-1 `/anniversaries` — storage + calendar

**Neon Postgres (Drizzle) is the source of truth; Google Calendar is a sync target.** See the app description above and the `@repo/anniversaries` package note.

- **Database** — Neon Postgres. Connection string in `DATABASE_URL` (root `.env` locally; Vercel project env var in deploys, provided by the Vercel ↔ Neon integration). `db/client.ts` uses the `neon-http` driver — no pooled sockets, edge/serverless-safe. Schema in `db/schema.ts` (`persons` + `person_members` + `person_events` + `users`); SQL migrations in `drizzle/`, applied automatically on each deploy (app-1's `build` runs `db:migrate` first) or manually with `pnpm --filter @repo/anniversaries db:migrate`. If `DATABASE_URL` is unset the store throws `DatabaseNotConfiguredError`; server actions surface it as the `"db-not-configured"` error code (distinct from the calendar's `"not-configured"`), and every DB/calendar failure is `console.error`'d with its root cause.
- **Shared calendar** — **one calendar owned by `anniversaries.calendar@gmail.com`**, not per-user calendars. Authenticates with that account's OAuth refresh token — root `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, optional `GOOGLE_CALENDAR_ID` (default `primary`). Client id/secret can be the same Google Cloud OAuth Web client used for Clerk's Google connection; the refresh token comes from a one-time OAuth consent by the bot account with scope `https://www.googleapis.com/auth/calendar`.
- `isCalendarConfigured()` (in `@repo/anniversaries`) checks **both** `DATABASE_URL` and a real Calendar API call; the UI shows `<CalendarUnavailable>` until both pass. `@repo/auth/user` gives `getCurrentUserEmail()` (to invite) and `getCurrentUserId()` (Clerk id, stored as `createdBy`). `@repo/auth/google` was removed — Google sign-in is identity-only.
- **Super user** — `ANNIVERSARIES_ADMIN_EMAILS` (root `.env`, comma-separated, default `anniversaries.calendar@gmail.com`). `isAnniversariesAdmin(email)` gates the member counts + "Family on this date" list; non-admins get `Anniversary.members: []`. Set it per Vercel environment in production too.

## Deployment

### app-1 → Vercel + Neon Postgres

app-1 deploys on **Vercel** (project `anniversaries`, root directory `apps/app-1`). The store is **Neon Postgres** via the Vercel ↔ Neon marketplace integration, which sets `DATABASE_URL` on the project.

**Two environments for app-1** (branch → Vercel environment → Neon database):

| Env      | Branch    | Vercel env                 | Neon                           | Notes                                                                                                                                                                                                                                                                                            |
| -------- | --------- | -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pre-prod | `preprod` | Preview (branch `preprod`) | its own Neon database / branch | shares the prod **Clerk instance** and the prod **shared Google Calendar** (same bot account / OAuth client / refresh token) — test events land on the real calendar, so use throwaway names. Also has `PROD_DATABASE_URL` (read-only, → prod Neon) for the Admin "Copy from production" button. |
| prod     | `main`    | Production                 | prod Neon database             | no `PROD_DATABASE_URL`                                                                                                                                                                                                                                                                           |

**Flow:** feature work → merge to `preprod` → verify on the pre-prod preview URL → merge `preprod` into `main` → prod deploys. Both are fast-forward when kept linear.

**Env vars per Vercel environment** (Project → Settings → Environment Variables):

- `DATABASE_URL` — from the Neon integration (different per environment).
- `PROD_DATABASE_URL` — **pre-prod / Preview only**; a read-only Neon connection string pointed at the prod database. Enables the `/admin` "Copy from production" button. `syncFromProd()` refuses if it equals `DATABASE_URL`.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (inlined at build — must be present at build time or every gated route 500s with `@clerk/nextjs: Missing publishableKey`), `CLERK_SECRET_KEY`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, optional `GOOGLE_CALENDAR_ID` — same values in both environments (the shared bot calendar).
- `ANNIVERSARIES_ADMIN_EMAILS` — comma list; same in both.

After changing env vars, **redeploy** for them to take effect.

The **Google Calendar API must be enabled** on the Google Cloud project behind the OAuth client — a disabled API surfaces as the `<CalendarUnavailable>` screen, with `[anniversaries] Google Calendar check failed: HTTP 403 …` in the Vercel function logs.

`apps/app-1/apphosting.yaml` is **legacy** (the old Firebase App Hosting config) — kept for reference, no longer a deploy target.

### Database migrations (Drizzle)

Run from the repo root; scripts load `DATABASE_URL` from the root `.env` / `.env.local`.

- `pnpm --filter @repo/anniversaries db:generate` — regenerate SQL after editing `db/schema.ts` (offline).
- `pnpm --filter @repo/anniversaries db:migrate` — apply pending migrations to the database in `DATABASE_URL`.
- **Migrations run automatically on deploy**: app-1's `build` script is `pnpm --filter @repo/anniversaries run db:migrate && next build`, so each Vercel environment migrates its own Neon DB before building. Run `db:migrate` by hand only for local dev or an out-of-band fix.
- New tables are generated as `CREATE TABLE IF NOT EXISTS` where practical, so a first auto-migrate is safe even if the schema was previously created via `db:push`.

### One-time Firestore → Neon migration (historical)

The store used to be **Firestore** (Firebase project `my-app-1` / `my-app-1-312d0`, named database `app-1`, Admin SDK). It was migrated to Neon with `scripts/migrate-firestore-to-neon.ts`:

1. Create a **read-only** service account in the prod Firebase project (`my-app-1-312d0`) with `roles/datastore.viewer`; download its key.
2. Put `PROD_FIREBASE_PROJECT_ID` / `PROD_FIREBASE_CLIENT_EMAIL` / `PROD_FIREBASE_PRIVATE_KEY` (+ optional `PROD_FIREBASE_DATABASE_ID=app-1`) and the target `DATABASE_URL` in the repo-root `.env.local`.
3. `pnpm --filter @repo/anniversaries db:migrate` (create the schema in the target Neon DB).
4. `pnpm --filter @repo/anniversaries migrate-firestore-to-neon` (dry run) → `… --commit` (write). Idempotent upserts by id; preserves document ids, `googleEventId`s, dates, Hebrew-date fields, `type`, `hebYear`, `origin`, `hebrewName`, `key`. **Never deletes Firestore data; never touches Google Calendar.**
5. `pnpm --filter @repo/anniversaries verify-migration` — counts + id diff + member/event counts; exits non-zero if incomplete.
6. Remove the `PROD_FIREBASE_*` vars from `.env.local` afterward.

`firebase-admin` is a **devDependency** used only by these scripts — nothing in the runtime path imports Firebase. The Firestore data and Firebase projects are left intact.

### Prod → pre-prod data sync (runtime, admin only)

The `/admin` page (super-user only) has a "Copy from production" button — `syncFromProd()` reads the prod Neon `persons` (via `PROD_DATABASE_URL`) and mirrors it into pre-prod (upsert matching ids, delete the rest; calendar untouched, since pre-prod shares the prod calendar so the copied `google_event_id`s still resolve). Gated on `PROD_DATABASE_URL` being set (Preview only); refuses if it equals `DATABASE_URL`.

### app-2 / landing → Firebase (unchanged)

app-2 and `landing` still target **Firebase** (App Hosting, region `europe-west4`, one project per app). Only app-1 moved to Vercel/Neon. `pnpm-workspace.yaml` `allowBuilds` covers `@firebase/util`, `protobufjs`, `esbuild`.

### Firestore — two patterns

**Admin SDK (server-only, authenticated writes)** — `firebase-admin` + a service account, `getFirestore(app, "<name>")`. No security rules involved (they're bypassed); use it when every call runs inside an authenticated server action and auth is Clerk, not Firebase Auth. app-1 `/anniversaries` used this before moving to Neon Postgres (the pattern is still valid for a future server-authoritative feature).

**Client SDK + security rules (read-mostly, browser)** — the intended pattern for app-2. Target a **named** database equal to the app name, **not `(default)`**:

```ts
export const db = getFirestore(firebaseApp, "app-2"); // NOT getFirestore(firebaseApp)
```

`getFirestore(firebaseApp)` produces `Database '(default)' not found`. Config comes from `NEXT_PUBLIC_FIREBASE_*` env vars in `apps/<app>/.env.local` (gitignored — never commit the values): `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`. The **same vars must also be set in App Hosting and redeployed**.

Security rules must be published to the **named** database, not `(default)` — a `Missing or insufficient permissions` error usually means they landed on the wrong one. Never fix a permissions error by opening the database to public writes.

**app-2's Firestore feature is not started.** It needs its own Firebase project (`my-app-2`), a named database `app-2`, its own Web App + `.env.local` + App Hosting env vars, and a `lib/firebase.ts`. It must not point at app-1's project.

## Custom domains (test/simulation — no domain purchased)

Plan: use the free `is-a.dev` service.

- `ilanisr.is-a.dev` — personal root/landing
- `app1.ilanisr.is-a.dev` → Firebase app-1
- `app2.ilanisr.is-a.dev` → Firebase app-2

The root registration is PR [is-a-dev/register#50502](https://github.com/is-a-dev/register/pull/50502) (from fork `IlanIsr/register`, file `domains/ilanisr.json`). Checks pass; awaiting maintainer merge. An hourly monitor watches the PR.

**Do not create the `app1`/`app2` is-a.dev registrations until the root PR is merged.** When configuring the subdomains, pull the _current_ DNS records from Firebase App Hosting (don't reuse stale values).

## Likely next tasks

1. Anniversaries persistence → **Neon Postgres (Drizzle)**, replacing Firestore. Store rewritten in `@repo/anniversaries`; one-time migration + verify scripts added; app-1 deploys on Vercel. **Still to do manually:** create the Neon databases (prod + pre-prod) via the Vercel ↔ Neon integration, run `db:migrate` against each, run the Firestore → Neon migration (see the Deployment section), set the Vercel env vars, deploy. Firestore data + Firebase projects are left intact until explicitly cleaned up.
2. Person editing (**done** on `preprod` — `updateAnniversary` + "Edit details" panel: name/type/hebrewName/origin/hebYear), notify-on-add + `users` table (**done**), per-person "Add someone" + list-wide "Share my list" (**done**), env-tinted favicon (**done**). Remaining idea: use `users.has_sent_email` to pre-uncheck the notify box when everyone's already been invited.
3. Build app-2's Firestore feature using the client-SDK pattern above.
4. After PR #50502 merges: configure `app1`/`app2.ilanisr.is-a.dev` subdomains (app-1 → Vercel, app-2 → Firebase App Hosting; pull current DNS from each).

Before changing anything deploy/backend-related, inspect the actual current repo + Vercel + Neon + Firebase state — setup may have progressed since this was written.
