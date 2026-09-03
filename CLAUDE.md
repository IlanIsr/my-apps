# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `TECHNICAL_RULES.md` for working preferences (conciseness, scope, styling).

## What this repo is

A personal pnpm + Turborepo monorepo holding **multiple independent web apps** plus shared packages. The apps are not one product and not one Next.js app with many routes — the separation is intentional. Each app is independently deployable, has its own Firebase project and Firestore resources, and will eventually have its own subdomain, while still consuming shared workspace packages.

Apps:
- `app-1` (:3000) — **Hebrew Date Converter**, a Hebrew ⇄ Gregorian date tool built on `@hebcal/core`. Pure client-side; no backend. Calendar logic is isolated in `apps/app-1/lib/hebcal.ts`. Trilingual (en/he/fr) — see i18n note below.
- `app-2` (:3001) — placeholder (shows `@repo/utils` output). Slated for a Firestore feature.
- `landing` (:3002) — index page linking to the other apps; app list hardcoded in `app/page.tsx` for now, to move to Firestore later.

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

## Code architecture

### Shared packages (consumed as raw source, not built)

- `@repo/utils` — plain `.ts`, exports `./src/index.ts` directly. No build step or `dist/`; importers compile it. Editing it is picked up by both apps (and by deployed apps — this was tested).
- `@repo/ui` — React components, exports per-file as `./src/*.tsx` (import as `@repo/ui/button`). Raw source. Starter-quality on purpose; leave it.
- `@repo/tailwind-config` — shared Tailwind v4 base (`styles.css`, exported as `.`). See the styling note above.
- `@repo/eslint-config` — flat-config presets `./base`, `./next-js`, `./react-internal`. `base.js` includes `eslint-config-prettier`, `typescript-eslint`, `eslint-plugin-turbo`, and `eslint-plugin-only-warn` (downgrades every rule to a warning — combined with the apps' `--max-warnings 0`, warnings still block).
- `@repo/typescript-config` — `base.json`, `nextjs.json`, `react-library.json`. Base is strict with `noUncheckedIndexedAccess` and `NodeNext` resolution.

Apps consume these via `workspace:*`. Changes to a package are seen directly by apps (no rebuild), but `pnpm build` / `check-types` still re-runs because Turbo caches per-package.

### Toolchain notes

- TypeScript `7.0.2` (native compiler) across apps and packages. `@repo/eslint-config` additionally aliases `typescript` to `npm:@typescript/typescript6@6.0.2` for `typescript-eslint` compatibility.
- ESLint 10 flat config only. Each app's `eslint.config.js` just re-exports `nextJsConfig` from `@repo/eslint-config/next-js`. Note `eslint-plugin-react-hooks` v7 flags the `useEffect(() => setMounted(true))` mount pattern — drive theme-dependent rendering off the `.dark` class in CSS instead.
- All apps: Next.js 16 App Router, React 19, `"type": "module"`, root `app/` dir. app-1 also has `lib/` and `i18n/` dirs and a `@/*` → `./*` tsconfig path alias (app-2/landing are too small to need one).

### app-1 i18n

Hand-rolled, no library. `apps/app-1/i18n/`: `config.ts` (locales `en`/`he`/`fr`, dir, `Intl` tags), `messages/{en,he,fr}.ts` typed against `types.ts`, `context.tsx` (`I18nProvider` + `useI18n()` → `{ locale, setLocale, t, dir }`). Locale is persisted in `localStorage` (`app-1.locale`) and read via `useSyncExternalStore` (falls back to `navigator.language`, then `en`). An inline script in `layout.tsx` sets `<html lang/dir>` before paint to avoid an RTL flash — **keep its storage key and locale list in sync with `config.ts`**. Gregorian month names come from `Intl.DateTimeFormat`, not the message files. Add a UI string → add it to `types.ts` and all three message files (TS enforces completeness).

## Firebase

**One Firebase project per app.** Deployed via **Firebase App Hosting** (not classic Hosting), region `europe-west4`.

| App | Firebase project | App Hosting backend | Web app | Root dir |
|---|---|---|---|---|
| app-1 | `my-app-1` | `app-1` (intended) | `app-1-web` | `apps/app-1` |
| app-2 | `my-app-2` | `app-2` (intended) | `app-2-web` | `apps/app-2` |

Backend name, repo name, Firebase project name, and Web App name are **separate concepts**. The first app-1 backend was auto-named `my-apps` (the repo name); a rename toward the table above was in progress. **Check the current Firebase state before assuming the cleanup is done.**

App Hosting deploys automatically from `main`. There is no `apphosting.yaml` in the repo — backend config (including production env vars) lives in the Firebase console. Path filters are configured per backend so an app-only change deploys only that app; changing `packages/**` (or root `package.json` / lockfile / `pnpm-workspace.yaml` / `turbo.json`) can deploy both. Keep this. Production env vars must be set in App Hosting *and redeployed* — missing them causes `FirebaseError: client is offline` / stuck "Loading...".

**Neither app currently uses Firebase in code.** app-1 was wired to Firestore, then reverted when it became the (backend-less) date tool. `apps/app-1/.env.local` still holds the old Firebase config (gitignored, unused — safe to delete). `pnpm-workspace.yaml` `allowBuilds` (`@firebase/util`, `protobufjs`) is left in place for when Firebase returns.

### Firestore — the pattern to reuse (from app-1's removed setup)

When adding Firestore to an app, target a **named** database equal to the app name, **not `(default)`**:

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

1. Build app-2's Firestore feature using the pattern above.
2. After PR #50502 merges: configure `app1`/`app2.ilanisr.is-a.dev` subdomains via Firebase App Hosting.

Before changing anything Firebase/backend-related, inspect the actual current repo and Firebase state — naming cleanup may have progressed since this was written.
