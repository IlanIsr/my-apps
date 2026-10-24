/**
 * The `landing` index page (myappshub.dev): one button per app. Public — it's
 * only links, and each app has its own sign-in gate.
 *
 * The app list is hardcoded. In dev the links point at the local dev servers
 * so cross-app navigation — and the shared Clerk session across localhost
 * ports — works end to end.
 */

const isDev = process.env.NODE_ENV === "development";

const apps = [
  {
    name: "Anniversaries",
    description: "Hebrew birthdays and yahrzeits, synced to Google Calendar.",
    url: isDev ? "http://localhost:3000" : "https://anniversaries.dev/",
  },
  {
    name: "Classeur Panini",
    description: "Sticker-album tracker: collection, swaps, page prizes.",
    url: isDev ? "http://localhost:3001" : "https://panini.myappshub.dev/",
  },
];

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My Apps</h1>
        <p className="mt-1 opacity-70">
          A collection of small independent apps.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <li key={app.url}>
            <a
              href={app.url}
              className="group flex h-full flex-col gap-4 rounded-xl border border-foreground/15 bg-white/40 p-5 transition-colors hover:border-foreground/40 hover:bg-white/70"
            >
              <span>
                <span className="block text-lg font-medium">{app.name}</span>
                <span className="mt-1 block text-sm opacity-70">
                  {app.description}
                </span>
              </span>
              <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity group-hover:opacity-85">
                Open
                <span aria-hidden>→</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
