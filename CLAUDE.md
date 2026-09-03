# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `TECHNICAL_RULES.md` for working preferences (conciseness, scope, styling).

## What this repo is

A personal pnpm + Turborepo monorepo holding **multiple independent web apps** plus shared packages. The apps are not one product and not one Next.js app with many routes — the separation is intentional. Each app is independently deployable, has its own Firebase project and Firestore resources, and will eventually have its own subdomain, while still consuming shared workspace packages.

Apps:
- `app-1` (:3000) — Hebrew-calendar tools. `/` redirects to `/anniversaries`; `/converter` is the **Hebrew Date Converter** (client-side, `@repo/hebcal`).
  - **`/anniversaries`** — a family **Hebrew-anniversary** manager. **Firestore (`app-1` named DB) is the source of truth; Google Calendar is a sync target.** Each family member is a `persons/{id}` document (name, hebrewName?, origin?, hebDate, `members` = lowercased emails, `events[]`, `key` = normalized-name + Hebrew day/month for dedup). Every mutation writes Firestore then `syncPersonEvents()` reconciles that person's calendar events. All events live on **one shared calendar** (`anniversaries.calendar@gmail.com`); the app authenticates AS that account with a stored refresh token (`google-auth-library`). Calendar events link back via `extendedProperties.private.personId` (no JSON blob in the description any more). All this lives in `@repo/anniversaries`; app-1 only has the route `page.tsx`/`actions.ts` glue (`app/anniversaries/actions.ts`) that adds auth (`getCurrentUserEmail()` / `getCurrentUserId()`) and i18n (`summary`). "Add an anniversary" either creates N years of events (eve + tzeit hakochavim) or — if a matching person exists — adds the signed-in user and tops up missing years. Family members are **optional, hidden attendees** (`optional: true`, `guestsCanSeeOtherGuests: false`), so the event lands on their personal calendars without the app touching them. "Remove from my list" drops you from `members` (and from the events' attendees) — **the person + events always stay on the shared calendar, even with zero members**. The app never deletes an event; only a manual action on the shared account does (`pnpm --filter @repo/anniversaries clear-calendar`). A member who sets `responseStatus: declined` on the shared calendar (i.e. deletes the invite from their own calendar) is treated the same as leaving — removed from `members`, never re-invited.
  - Per-user Google Calendar scope is **not** used — the app only needs the user's email (`@repo/auth/user` → `getCurrentUserEmail()`) to invite them.
  - `/calendar` is a flat chronological agenda of every upcoming event.
  - Trilingual (en/he/fr).
- `app-2` (:3001) — placeholder (shows `@repo/utils` output). Slated for a Firestore feature.
- `landing` (:3002) — index page linking to the other apps; app list hardcoded in `app/page.tsx` for now, to move to Firestore later.

All three are gated behind Clerk auth — see the Auth section.

All three apps use Tailwind v4 via the shared `@repo/tailwind-config` package: each app's `app/globals.css` is just `@import "@repo/tailwind-config";` and has a `postcss.config.mjs` with `@tailwindcss/postcss`. `packages/tailwind-config/styles.css` defines the palette as CSS vars under `:root` / `.dark` and exposes them via `@theme inline`, so `bg-background` / `text-foreground` follow the active theme with no extra classes. Light: `#ffe5cc` / `#000000`. Dark: `#000000` / `#ffffff`. Plus `--color-primary/-secondary/-accent` (placeholders). Dark mode is class-based (`<html class="dark">`); only app-1 toggles it (via `next-themes`) — app-2/landing stay light. Edit that one file to change the palette everywhere.

GitHub: `IlanIsr/my-apps` (branch `main`). `gh` is installed and authenticated as `IlanIsr`; `gh auth setup-git` is configured, so git/gh over HTTPS work without prompting.

Requires Node >= 24 and pnpm 11 (`packageManager` is pinned to `pnpm@11.25.0`).

### Architecture rules to preserve

- Apps are independent and independently buildable/deployable. One Firebase project per app; do not merge their Firebase resources.
- Shared code lives in `packages/*`. An app must never import source from another app. A concern used by more than one app becomes a package.
- Don't over-engineer shared packages. In particular **keep `packages/ui` as-is** (mostly the Turborepo starter) — do not redesign or refactor it unless explicitly asked.
- Prefer simple, maintainable solutions. Preserve the working pnpm + Turborepo + Firebase App Hosting setup.

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

Next only reads `.env*` from an app's own directory. `@repo/env/load` (imported at the top of every `apps/*/next.config.js`) backfills from a **monorepo-root `.env`** with `override: false` — so shared defaults live in root `.env` (git-ignored; see `.env.example`), and an app's own `apps/<name>/.env.local` overrides them. Production sets vars per App Hosting backend, which also win (nothing is committed).

## Code architecture

### Shared packages (consumed as raw source, not built)

- `@repo/utils` — plain `.ts`, exports `./src/index.ts` directly. No build step or `dist/`; importers compile it. Editing it is picked up by both apps (and by deployed apps — this was tested).
- `@repo/ui` — React components, exports per-file as `./src/*.tsx` (import as `@repo/ui/button`). Raw source. Starter-quality on purpose; leave it.
- `@repo/tailwind-config` — shared Tailwind v4 base (`styles.css`, exported as `.`). See the styling note above.
- `@repo/auth` — Clerk wiring shared by all apps. Exports `./proxy` (`clerkProxy` handler), `./provider` (`<AuthProvider>`), `./sign-in` (`<SignInView>`), `./nav` (`<AuthControl>`). See the Auth section below.
- `@repo/env` — `./load` (a side-effect JS module) backfills env vars from the root `.env`; imported by each app's `next.config.js`. See the Env vars note.
- `@repo/hebcal` — Hebrew ⇄ Gregorian date logic (wraps `@hebcal/core`). `convert.ts`: `findNextHebrewDate`, `calculateHebrewDate`, `HEBREW_MONTH_KEYS`. `anniversary.ts`: `calculateNextDates` (N future Gregorian dates for a Hebrew day/month, shifted to the eve), `gregorianToHebrew`, `hebrewToGregorian`. `parse.ts`, `zmanim.ts` (`getTsetHakohavim` from hebcal.com). Its own tsconfig uses `moduleResolution: Bundler` so multi-file relative imports need no `.js` extension.
- `@repo/anniversaries` — the anniversary **backend** (portable, storage-agnostic on purpose so it can become a standalone service later). `store.ts`: Firestore (source of truth) via the **Firebase Admin SDK** — server-only, named DB `FIREBASE_DATABASE_ID` (default `app-1`). Deliberately *not* the client-SDK + security-rules pattern used elsewhere, because auth is Clerk (not Firebase Auth) and every call runs inside an authenticated server action. `calendar.ts`: Google Calendar sync against the shared bot calendar (`syncPersonEvents`, `deletePersonEvents`, `patchEvent`) — authenticates AS `anniversaries.calendar@gmail.com` via `google-auth-library` + stored refresh token, Calendar REST API via `fetch`. `service.ts`: orchestration — `isCalendarConfigured` (checks store **and** calendar), `listAnniversaries`, `getAnniversary`, `addAnniversary`, `leaveAnniversary`, `updateEvent`, `NoSuchHebrewDateError`. `person.ts`: `Anniversary`/`AnniversaryEvent` types + identity helpers (`normalizeName`, `anniversaryKey`, `formatHebDateLabel`). `scripts/`: `migrate-to-firestore.ts` (one-time Calendar→Firestore migration, `pnpm --filter @repo/anniversaries migrate [--commit]`) and `clear-calendar.ts` (wipe the shared calendar, `… clear-calendar [--commit]`) — both run via `tsx`, loading env from root `.env` / `apps/app-1/.env`. Depends on `@repo/hebcal`. Callers pass the signed-in user's email + Clerk id + a pre-translated event `summary` — the package does no auth or i18n. Same `moduleResolution: Bundler` setup as `@repo/hebcal`.
- `@repo/eslint-config` — flat-config presets `./base`, `./next-js`, `./react-internal`. `base.js` includes `eslint-config-prettier`, `typescript-eslint`, `eslint-plugin-turbo`, and `eslint-plugin-only-warn` (downgrades every rule to a warning — combined with the apps' `--max-warnings 0`, warnings still block).
- `@repo/typescript-config` — `base.json`, `nextjs.json`, `react-library.json`. Base is strict with `noUncheckedIndexedAccess` and `NodeNext` resolution.

Apps consume these via `workspace:*`. Changes to a package are seen directly by apps (no rebuild), but `pnpm build` / `check-types` still re-runs because Turbo caches per-package.

### Toolchain notes

- TypeScript `7.0.2` (native compiler) across apps and packages. `@repo/eslint-config` additionally aliases `typescript` to `npm:@typescript/typescript6@6.0.2` for `typescript-eslint` compatibility.
- ESLint 10 flat config only. Each app's `eslint.config.js` just re-exports `nextJsConfig` from `@repo/eslint-config/next-js`. Note `eslint-plugin-react-hooks` v7 flags the `useEffect(() => setMounted(true))` mount pattern — drive theme-dependent rendering off the `.dark` class in CSS instead.
- All apps: Next.js 16 App Router, React 19, `"type": "module"`, root `app/` dir. app-1 also has `lib/` and `i18n/` dirs and a `@/*` → `./*` tsconfig path alias (app-2/landing are too small to need one).

### app-1 i18n (component-owned text types)

Hand-rolled, no library, pattern borrowed from the `exam_training` repo. **Every component exports its own `XxxTexts` type and takes a `t: XxxTexts` prop — no component calls `useTranslations()`.** It's called only in: `page.tsx` files that are client components (`/converter`, `/anniversaries/new`); a per-route client boundary (`AnniversariesView`, `AnniversaryDetailView`, `AgendaView`) that the server `page.tsx` renders *after* its Google-Calendar fetch; and `Navbar` (the shell). Those provide the `t` slices to the feature components. `i18n/messages.ts` assembles the `Messages` type by importing every component's `XxxTexts`; each `i18n/dictionaries/<locale>/<feature>.ts` does `export const x = {…} as const satisfies XxxTexts`, and `<locale>/index.ts` does `satisfies Messages`.

- `i18n/`: `config.ts` (locales `en`/`he`/`fr`, dir, `Intl` tags), `language-context.ts` / `language-provider.tsx` (`I18nProvider`), `use-language.ts` (`useLanguage()` → `{ locale, dir, setLocale }`), `use-translations.ts` (`useTranslations()` → `Messages`), `index.ts` (barrel — import from `@/i18n`), `dictionaries/<locale>/*`.
- Locale is persisted in `localStorage` (`app-1.locale`), read via `useSyncExternalStore` (falls back to `navigator.language`, then `en`). An inline script in `layout.tsx` sets `<html lang/dir>` before paint — **keep its storage key + locale list in sync with `config.ts`**.
- Gregorian month names come from `Intl.DateTimeFormat`, not the dictionaries. The event-title text lives in `lib/event-summary.ts` (`EventSummaryTexts`) so server actions can use it via `getDictionary(locale)`.
- **Add a UI string**: add it to the owning component's `XxxTexts` type, then to that feature's file in all three `dictionaries/<locale>/`.

## Auth (Clerk)

All three apps are **fully gated** — every route redirects to `/sign-in` without a session — via **one shared Clerk instance** (same keys everywhere), so a session on one app carries to the others.

- **Cross-app SSO**: Clerk shares sessions across subdomains automatically and across `localhost` ports, so it works in local dev today. In production it only works once the apps are on subdomains of one domain (`*.ilanisr.is-a.dev`) — on the current `*.hosted.app` URLs each app is an isolated site and sessions won't carry. No satellite-domain config needed; just point all apps at the same Clerk **production** instance once the domains are live.
- **Wiring per app**: `proxy.ts` (Next 16's renamed middleware — re-exports `clerkProxy`, but `config.matcher` must be a literal in the file), `<AuthProvider>` in the root layout, `<AuthControl>` in the header, `app/sign-in/[[...sign-in]]/page.tsx` rendering `<SignInView>`.
- **`@clerk/nextjs` is v7 / "Core 3"** (March 2026): `<SignedIn>`/`<SignedOut>`/`<Protect>` are gone — use `<Show when="signed-in">`. `createRouteMatcher` is deprecated. The proxy does a plain `auth()` + `NextResponse.redirect` instead.
- Social-only (Google + Apple) is configured in the Clerk dashboard, not code.
- **Keys**: put `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in the root `.env` (see env note below). Set them per App Hosting backend for production.

### app-1 `/anniversaries` — storage + calendar

**Firestore is the source of truth; Google Calendar is a sync target.** See the app description above and the `@repo/anniversaries` package note.

- **Firestore** — Firebase project `my-app-1`, **named** database `app-1` (not `(default)`), via the Admin SDK. Env vars in the **root `.env`**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (a service-account key; keep the literal `\n`s — `store.ts` un-escapes them), optional `FIREBASE_DATABASE_ID` (default `app-1`). Publish deny-all client rules to the `app-1` DB (`allow read, write: if false;`) — the Admin SDK bypasses them; it's hygiene.
- **Shared calendar** — **one calendar owned by `anniversaries.calendar@gmail.com`**, not per-user calendars. Authenticates with that account's OAuth refresh token — root `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, optional `GOOGLE_CALENDAR_ID` (default `primary`). Client id/secret can be the same Google Cloud OAuth Web client used for Clerk's Google connection; the refresh token comes from a one-time OAuth consent by the bot account with scope `https://www.googleapis.com/auth/calendar`.
- `isCalendarConfigured()` (in `@repo/anniversaries`) checks **both** the store env and a real Calendar API call; the UI shows `<CalendarUnavailable>` until both pass. `@repo/auth/user` gives `getCurrentUserEmail()` (to invite) and `getCurrentUserId()` (Clerk id, stored as `createdBy`). `@repo/auth/google` was removed — Google sign-in is identity-only.
- **Fresh start** (chosen over migrating): the shared calendar was wiped and Firestore started empty; data is created organically by using the app. The `migrate` script is kept for reference / if a future re-import is needed.

## Firebase

**One Firebase project per app.** Deployed via **Firebase App Hosting** (not classic Hosting), region `europe-west4`.

| App | Firebase project | App Hosting backend | Web app | Root dir |
|---|---|---|---|---|
| app-1 | `my-app-1` | `app-1` (intended) | `app-1-web` | `apps/app-1` |
| app-2 | `my-app-2` | `app-2` (intended) | `app-2-web` | `apps/app-2` |

Backend name, repo name, Firebase project name, and Web App name are **separate concepts**. The first app-1 backend was auto-named `my-apps` (the repo name); a rename toward the table above was in progress. **Check the current Firebase state before assuming the cleanup is done.**

App Hosting deploys automatically from `main`. There is no `apphosting.yaml` in the repo — backend config (including production env vars) lives in the Firebase console. Path filters are configured per backend so an app-only change deploys only that app; changing `packages/**` (or root `package.json` / lockfile / `pnpm-workspace.yaml` / `turbo.json`) can deploy both. Keep this. Production env vars must be set in App Hosting *and redeployed* — missing them causes `FirebaseError: client is offline` / stuck "Loading...".

**app-1 `/anniversaries` uses Firestore via the Admin SDK** (see the app-1 storage section above) — a **named** database `app-1` in project `my-app-1`, service-account creds in the root `.env`. app-2 does not use Firebase yet. `pnpm-workspace.yaml` `allowBuilds` covers `@firebase/util`, `protobufjs`, `esbuild` (the last for `tsx`, used by the migration script).

### Firestore — two patterns

**Admin SDK (server-only, authenticated writes)** — what app-1 `/anniversaries` uses. `firebase-admin` + a service account, `getFirestore(app, "app-1")`. No security rules involved (they're bypassed); use it when every call runs inside an authenticated server action and auth is Clerk, not Firebase Auth.

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

**Do not create the `app1`/`app2` is-a.dev registrations until the root PR is merged.** When configuring the subdomains, pull the *current* DNS records from Firebase App Hosting (don't reuse stale values).

## Likely next tasks

1. Anniversaries → Firestore (branch `firestore-anniversaries`): `FIREBASE_*` are set in `apps/app-1/.env`, calendar wiped, starting fresh. Remaining: user smoke-tests locally, then merge to `main` + set `FIREBASE_*` in the app-1 App Hosting backend and redeploy.
2. Phase 5: `origin` / `hebrewName` UI on the create form + person editing (backend already stores them).
3. Build app-2's Firestore feature using the client-SDK pattern above.
4. After PR #50502 merges: configure `app1`/`app2.ilanisr.is-a.dev` subdomains via Firebase App Hosting.

Before changing anything Firebase/backend-related, inspect the actual current repo and Firebase state — naming cleanup may have progressed since this was written.
