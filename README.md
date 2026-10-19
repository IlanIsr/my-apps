# my-apps

A personal pnpm + Turborepo monorepo holding multiple independent web apps plus shared packages. See `CLAUDE.md` for the full architecture and `TECHNICAL_RULES.md` for working conventions.

## What's inside?

### Apps

- `app-1` (:3000) — Hebrew-calendar tools (Hebrew date converter + the `/anniversaries` family-anniversary manager). Deploys to Vercel, backed by Neon Postgres.
- `panini` (:3001) — Classeur Panini, a sticker-album tracker. Deploys to Vercel, backed by its own Neon Postgres project.
- `landing` (:3002) — index page linking to the other apps. No deploy target for now.

### Packages

- `@repo/ui`, `@repo/heroui` — shared React components.
- `@repo/tailwind-config` — shared Tailwind v4 base.
- `@repo/auth` — shared Clerk wiring.
- `@repo/hebcal` — Hebrew ⇄ Gregorian date logic.
- `@repo/anniversaries` — the anniversary feature's storage-agnostic backend.
- `@repo/env`, `@repo/utils` — env-loading and misc utilities.
- `@repo/eslint-config`, `@repo/typescript-config` — shared lint/TS configs.

Each app/package is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

Already set up across the workspace:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Commands

Run from the repo root:

```sh
pnpm dev                    # run all apps
pnpm --filter app-1 dev     # run a single app
pnpm build                  # build all (respects dependency order)
pnpm lint                   # ESLint across the workspace
pnpm check-types            # typecheck every package
pnpm format                 # Prettier write
```

You can target a single package with a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters), e.g. `turbo build --filter=app-1`.

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share build caches across machines and CI. To enable it: `turbo login` then `turbo link` from the repo root.

## Useful Links

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
