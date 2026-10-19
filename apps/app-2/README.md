app-2 is a [Next.js](https://nextjs.org) app in the `my-apps` monorepo — currently a placeholder (shows `@repo/utils` output), slated for a Firestore feature. See the repo root `README.md` and `CLAUDE.md`.

## Getting Started

From the repo root:

```bash
pnpm --filter app-2 dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Deploy

app-2 deploys to **Firebase App Hosting** (region `europe-west4`), not Vercel — see `CLAUDE.md` for env var and deployment details.
