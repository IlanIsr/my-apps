`panini` is the **Classeur Panini** app in the `my-apps` monorepo — a sticker-album tracker (who owns which card, duplicates to trade, completed pages, page prizes). Next.js + Clerk + Neon Postgres (Drizzle), deployed on Vercel. See the repo root `CLAUDE.md`.

## Getting Started

From the repo root:

```bash
pnpm --filter panini dev
```

Open [http://localhost:3001](http://localhost:3001). Needs `apps/panini/.env` with `DATABASE_URL` (Neon project `panini`, branch `preprod`).

- `pnpm --filter panini db:generate` — regenerate SQL after editing `db/schema.ts`
- `pnpm --filter panini db:migrate` — apply migrations to `DATABASE_URL` (also runs on every Vercel build)
