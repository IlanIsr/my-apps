export const anniversary = {
  nav: "Anniversaries",
  listPage: {
    title: "Hebrew Anniversaries",
    subtitle: "Birthdays and yahrzeits on the Hebrew calendar, in your Google Calendar",
  },
  add: "Add an anniversary",
  search: "Search…",
  results: {
    count: (n: number) => `${n} ${n === 1 ? "person" : "people"}`,
    search: (shown: number, total: number, query: string) =>
      `${shown} of ${total} for “${query}”`,
  },
  empty: {
    none: "No anniversary events in your calendar yet.",
    noResults: "Nothing matches your search.",
    hint: "Add someone and their next years of events are created in Google Calendar.",
  },
  card: {
    hebDate: "Hebrew date",
    sharedWith: "Shared with",
    persons: (n: number) => `${n} ${n === 1 ? "person" : "people"}`,
    nextEvent: "Next",
    events: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
  },
  detail: {
    back: "← All anniversaries",
    hebDate: "Hebrew date",
    sharedWith: "Shared with",
    upcoming: "Upcoming events",
    deleteAll: "Delete all events",
  },
  new: {
    title: "New anniversary",
    subtitle: "Its next years of events will be added to your Google Calendar.",
  },
  form: {
    name: "Name",
    namePlaceholder: "Ilan Israel Bellaiche",
    hebDate: "Hebrew date",
    day: "Day",
    month: "Month",
    years: "Years ahead",
    sharedEmails: "Share with (emails, comma-separated)",
    sharedEmailsPlaceholder: "someone@example.com, other@example.com",
    sharedEmailsHelp: "They're added as optional attendees, invisible to each other.",
    submit: "Create events",
    submitting: "Creating…",
  },
  validation: {
    nameRequired: "Name is required.",
    emailInvalid: (email: string) => `Not a valid email: ${email}`,
  },
  notFound: {
    title: "Anniversary not found",
    message: "No calendar events for this person.",
  },
  toast: {
    created: (n: number) => `${n} event${n === 1 ? "" : "s"} created.`,
    deleted: (n: number) => `${n} event${n === 1 ? "" : "s"} deleted.`,
    error: (message: string) => `Something went wrong: ${message}`,
  },
};

export type AnniversaryMessages = typeof anniversary;
