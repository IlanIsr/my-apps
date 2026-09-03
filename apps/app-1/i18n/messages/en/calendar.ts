export const calendar = {
  nav: "Agenda",
  connect: {
    title: "Connect Google Calendar",
    subtitle: "Grant calendar access to create and manage anniversary events.",
    button: "Connect Google Calendar",
    signOut: "Sign out",
    connected: "Connected",
    notConnected: "Not connected",
    required: "Connect Google Calendar to manage events.",
    reconnect:
      "Calendar access wasn't granted. Sign out and back in to grant it.",
  },
  events: {
    title: "Google Calendar events",
    none: "No events yet.",
    list: (n: number) => `Events (${n})`,
    date: "Date",
    time: "Time",
    tsetHakohavim: "Tzeit hakochavim",
    viewInCalendar: "Open in Google Calendar →",
    deleteConfirm: "Delete this event?",
    deleteAllConfirm: (name: string) => `Delete all events for ${name}?`,
    edit: "Edit",
    editTime: "Time (HH:MM)",
    editTimeHint: "Leave empty for nightfall (tzeit hakochavim)",
    editShared: "Shared with (emails, comma-separated)",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving…",
  },
  actions: {
    create: "Create events",
    creating: "Creating…",
    deleteAll: "Delete all events",
    deleting: "Deleting…",
    delete: "Delete",
  },
  agenda: {
    title: "Agenda",
    subtitle: "Every upcoming anniversary event, in date order.",
    empty: "No upcoming anniversary events.",
  },
  eventSummary: (name: string) => `Anniversary of ${name}`,
};

export type CalendarMessages = typeof calendar;
