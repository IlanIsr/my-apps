// Hardcoded for now — will be replaced with data from Firestore.
// In dev the links point at the local dev servers so cross-app navigation
// (and the shared Clerk session across localhost ports) works end to end.
const isDev = process.env.NODE_ENV === "development";

const apps = [
  {
    name: "App 1",
    description: "First app",
    url: isDev
      ? "http://localhost:3000"
      : "https://app-1--my-app-1-312d0.europe-west4.hosted.app/",
  },
  {
    name: "App 2",
    description: "Second app",
    url: isDev
      ? "http://localhost:3001"
      : "https://my-apps-2--my-app-2-e72f1.europe-west4.hosted.app/",
  },
];

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My Apps</h1>
        <p className="mt-1 opacity-70">A collection of small independent apps.</p>
      </header>

      <ul className="flex flex-col gap-3">
        {apps.map((app) => (
          <li key={app.url}>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-foreground/15 p-4 transition-colors hover:border-foreground/40 hover:bg-foreground/5"
            >
              <span className="font-medium">{app.name}</span>
              <span className="mt-0.5 block text-sm opacity-70">
                {app.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
