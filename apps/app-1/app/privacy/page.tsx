/**
 * `/privacy` — public privacy policy, required for Google OAuth verification.
 * Reachable without signing in (see `proxy.ts`). Server-rendered, English only
 * (it is a legal document; the rest of the app is trilingual), and styled with
 * the app's own layout, fonts, palette, and primitives — no separate design
 * system.
 */

import type { Metadata } from "next";

import { BackLink } from "../components/BackLink";
import { Eyebrow } from "../components/Eyebrow";
import { Ornament } from "../components/Ornament";

export const metadata: Metadata = {
  title: "Privacy Policy · Anniversaries",
  description:
    "How Anniversaries handles your Google account and Google Calendar data.",
};

const LAST_UPDATED = "September 7, 2026";

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
      <h2 className="font-display text-lg font-semibold text-foreground">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 ps-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <BackLink href="/" label="Home" />
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="font-mono text-[11.5px] tracking-[0.08em] text-subtle-foreground uppercase">
          Last updated: {LAST_UPDATED}
        </p>
        <Ornament full className="mt-1" />
      </header>

      <div className="flex flex-col gap-7">
        <Section heading="Overview">
          <p>
            Anniversaries is a small application that tracks Hebrew-calendar
            birthdays and yahrzeits (memorial anniversaries) and places them on
            a shared Google Calendar. This policy explains what information the
            app collects, how it uses Google account and Google Calendar data,
            how that data is stored and shared, and how you can remove it. The
            app is operated by an individual; questions can be sent to{" "}
            <a
              className="text-foreground underline underline-offset-2"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section heading="Information we collect">
          <List
            items={[
              <>
                <strong className="font-semibold text-foreground">
                  Account information.
                </strong>{" "}
                When you sign in with Google, the app receives your email
                address and name from the sign-in provider (Clerk). It does not
                receive your Google password.
              </>,
              <>
                <strong className="font-semibold text-foreground">
                  Anniversary information you enter.
                </strong>{" "}
                The name of each person, whether the date is a birthday or a
                yahrzeit, the Hebrew and Gregorian dates, and optionally the
                Hebrew year, a Hebrew name, and a place of origin. You may also
                add the email addresses of family members you want to share an
                anniversary with.
              </>,
              <>
                <strong className="font-semibold text-foreground">
                  Calendar event references.
                </strong>{" "}
                For each anniversary, the app stores the identifiers and links
                of the Google Calendar events it created for it, so it can keep
                them up to date.
              </>,
              <>
                <strong className="font-semibold text-foreground">
                  Server logs.
                </strong>{" "}
                Standard request logs kept by the hosting provider for operating
                and securing the service.
              </>,
            ]}
          />
          <p>
            The app does not collect your location, contacts, files, or browsing
            activity, and it uses no advertising or analytics trackers.
          </p>
        </Section>

        <Section heading="Google account and sign-in information">
          <p>
            Sign-in is handled by Clerk. When you sign in with Google, the app
            receives your email address and name. Your email address is used to
            identify your account and to add you as a guest on the calendar
            events you ask to have shared with you. The app never receives or
            stores your Google password.
          </p>
        </Section>

        <Section heading="Google Calendar access">
          <p>
            The app manages a single shared &ldquo;Anniversaries&rdquo; Google
            Calendar owned by a dedicated Google account operated for this
            purpose. Access to that calendar is authorized once, for that
            account, using the{" "}
            <code className="rounded bg-sunken px-1 py-0.5 font-mono text-[12px] text-foreground">
              https://www.googleapis.com/auth/calendar
            </code>{" "}
            scope.
          </p>
          <p>Using this access, the app:</p>
          <List
            items={[
              "creates calendar events for the anniversaries you add (an event on the eve and one at nightfall);",
              "reads back the events it previously created on that calendar, so it can reconcile them with your list;",
              "updates those events' dates, times, titles, colors, and guest lists;",
              "can delete those events (deletion is currently performed only as an administrative maintenance action, not from within the app).",
            ]}
          />
          <p>
            The app only touches events it created on that one shared calendar.
            It does not read your personal Google Calendar, your other
            calendars, or events created by anyone else. When you share an
            anniversary with a family member, that person&rsquo;s email address
            is added to the relevant events as an optional guest, which is what
            makes the anniversary appear on their own calendar.
          </p>
        </Section>

        <Section heading="Why Google Calendar access is required">
          <p>
            The purpose of Anniversaries is to put recurring Hebrew-date
            anniversaries onto a real calendar that people already check, with
            the correct eve and nightfall times, and to keep those events
            correct from one year to the next. Creating and updating those
            events, and inviting the family members you choose, is not possible
            without Google Calendar write access.
          </p>
        </Section>

        <Section heading="How we use information">
          <p>
            The information above is used only to operate the anniversary
            feature: to compute the Gregorian dates of your Hebrew
            anniversaries, to create and maintain the corresponding calendar
            events, to show you your list, and to keep the app secure and
            functioning. Google user data is not used for advertising and is not
            used to build profiles for any purpose unrelated to the app.
          </p>
        </Section>

        <Section heading="How information is stored">
          <List
            items={[
              "Anniversary records and family-member email lists are stored in a managed PostgreSQL database (Neon) hosted in the European Union.",
              "Calendar events and their contents are stored by Google on the shared calendar.",
              "Authentication and session data are held by Clerk.",
              "The application is hosted on Vercel.",
              "The OAuth token used for calendar access and the database credentials are stored as secrets in the hosting platform's configuration, not in the application's source code.",
            ]}
          />
        </Section>

        <Section heading="How information is shared">
          <p>
            The app does not sell your personal information and does not share
            it for advertising. Information is shared only with the service
            providers needed to run the app, and only for that purpose:
          </p>
          <List
            items={[
              "Google — to create and update the calendar events and guest invitations you request (Google Calendar API).",
              "Clerk — to authenticate you.",
              "Neon — to store anniversary records.",
              "Vercel — to host and serve the application.",
            ]}
          />
          <p>
            Email addresses you add to an anniversary are shared with Google as
            event guests, which is the mechanism that puts the anniversary on
            their calendar. Information may also be disclosed if required by law
            or to protect the security or integrity of the service.
          </p>
        </Section>

        <Section heading="Google API Services User Data Policy">
          <p>
            Anniversaries&rsquo; use and transfer of information received from
            Google APIs to any other app will adhere to the{" "}
            <a
              className="text-foreground underline underline-offset-2"
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Specifically:
          </p>
          <List
            items={[
              "Google user data is used only to provide and improve the user-facing features described in this policy.",
              "It is not transferred to others except as necessary to provide those features, for security purposes, or to comply with applicable law.",
              "It is not used for advertising.",
              "Humans do not read it, except with your consent for a specific action, where necessary for security (such as investigating abuse or a bug), or to comply with applicable law.",
            ]}
          />
        </Section>

        <Section heading="Data retention and deletion">
          <List
            items={[
              "Anniversary records are kept until they are deleted.",
              <>
                You can remove yourself from an anniversary in the app
                (&ldquo;Remove from my list&rdquo;), which removes your email
                address from that record and from the event guest lists.
              </>,
              <>
                To have an anniversary record and its calendar events removed
                entirely, or to have your account data deleted, email{" "}
                <a
                  className="text-foreground underline underline-offset-2"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and it will be done.
              </>,
              "Server logs are retained for a limited period by the hosting provider according to their standard practice.",
            ]}
          />
        </Section>

        <Section heading="Revoking Google access">
          <List
            items={[
              <>
                To stop signing in with Google, remove this app from your Google
                account&rsquo;s third-party access page:{" "}
                <a
                  className="text-foreground underline underline-offset-2"
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  myaccount.google.com/permissions
                </a>
                .
              </>,
              "Calendar access is held by the app's own dedicated Google account, not by yours, so revoking your Google permissions does not by itself remove events already on the shared calendar. To have your anniversaries and their events removed, contact us.",
            ]}
          />
        </Section>

        <Section heading="Security">
          <List
            items={[
              "Traffic between your browser and the app is served over HTTPS.",
              "OAuth tokens and database credentials are kept as platform secrets rather than in source code, and database access is restricted to the application's server.",
              "No online service can be guaranteed completely secure, and we cannot promise that unauthorized access will never occur.",
            ]}
          />
        </Section>

        <Section heading="Information about family members">
          <p>
            An anniversary record you create may contain information about other
            people — including minors — such as a name and a date of birth. You
            provide this information, and you are responsible for having a basis
            to share it. If someone asks you to remove information about them,
            you can do so in the app or by contacting us.
          </p>
        </Section>

        <Section heading="Changes to this policy">
          <p>
            This policy may be updated. The &ldquo;Last updated&rdquo; date at
            the top reflects the current version, and any material change will
            be described here.
          </p>
        </Section>

        <Section heading="Contact">
          <p>
            Questions about this policy or requests about your data:{" "}
            <a
              className="text-foreground underline underline-offset-2"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
