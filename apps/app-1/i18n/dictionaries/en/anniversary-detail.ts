import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

const NOT_CONNECTED =
  "Calendar access wasn’t granted. Sign out and back in to grant it.";

export const anniversaryDetail = {
  back: "← All anniversaries",
  hebDate: "Hebrew date",
  sharedWith: "Shared with",
  upcoming: "Upcoming events",
  deleteAll: "Delete all events",
  delete: "Delete",
  edit: "Edit",
  viewInCalendar: "Open in Google Calendar →",
  deleteConfirm: "Delete this event?",
  deleteAllConfirm: (name: string) => `Delete all events for ${name}?`,
  error: (message: string) => `Something went wrong: ${message}`,
  editForm: {
    date: "Date",
    time: "Time (HH:MM)",
    timeHint: "Leave empty for nightfall (tzeit hakochavim)",
    shared: "Shared with (emails, comma-separated)",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    notConnected: NOT_CONNECTED,
  },
} as const satisfies AnniversaryDetailTexts;
