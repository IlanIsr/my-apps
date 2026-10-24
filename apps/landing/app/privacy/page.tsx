/**
 * `/privacy` — public privacy policy for myappshub.dev and the apps on its
 * subdomains, required to publish the Google OAuth consent screen behind
 * Clerk's Google sign-in. Reachable without signing in (see `proxy.ts`).
 * English only, like app-1's policy (it is a legal document).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · My Apps",
  description: "How myappshub.dev and its apps handle your data.",
};

const LAST_UPDATED = "October 22, 2026";
const CONTACT_EMAIL = "ilanbellaichepro@gmail.com";

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed opacity-80">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm opacity-70">Last updated: {LAST_UPDATED}</p>
      </header>

      <Section heading="Overview">
        <p>
          myappshub.dev hosts a few small personal applications, each on its own
          subdomain (for example panini.myappshub.dev, a sticker-album tracker).
          They are operated by an individual. This policy explains what
          information they collect and how it is used. Questions can be sent to{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section heading="Sign-in">
        <p>
          Sign-in is handled by Clerk, with Google. The apps receive your email
          address, name and profile picture from the sign-in provider, and use
          them only to identify your account. They never receive your password
          and request no other access to your Google account.
        </p>
      </Section>

      <Section heading="Information you enter">
        <p>
          Each app stores only what you enter into it — for example, in Classeur
          Panini, the names of collectors you add and the sticker counts you
          record. This data is linked to your account and is not visible to
          other users.
        </p>
      </Section>

      <Section heading="How information is stored and shared">
        <p>
          Data is stored in a Postgres database hosted by Neon, and the apps run
          on Vercel; both act as service providers. Information is never sold,
          shared with advertisers, or used for any purpose other than running
          the apps. There are no advertising or analytics trackers.
        </p>
      </Section>

      <Section heading="Data retention and deletion">
        <p>
          Your data is kept as long as your account exists. To have your account
          and all associated data deleted, email{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          If this policy changes, the updated version will be posted on this
          page with a new &ldquo;last updated&rdquo; date.
        </p>
      </Section>
    </main>
  );
}
