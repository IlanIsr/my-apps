import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

export const anniversaryDetail = {
  back: "← All anniversaries",
  hebDate: "Hebrew date",
  members: "On the list",
  upcoming: "Upcoming events",
  edit: "Edit",
  viewInCalendar: "Open in Google Calendar →",
  join: "Add to my list",
  joining: "Adding…",
  leave: "Remove from my list",
  leaving: "Removing…",
  leaveConfirm: "Remove yourself from this anniversary?",
  error: (message: string) => `Something went wrong: ${message}`,
  editForm: {
    date: "Date",
    time: "Time (HH:MM)",
    timeHint: "Leave empty for nightfall (tzeit hakochavim)",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    error: (message: string) => `Something went wrong: ${message}`,
  },
} as const satisfies AnniversaryDetailTexts;
