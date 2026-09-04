import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export const anniversaryDetail = {
  back: "All anniversaries",
  eyebrow: { birthday: "Birthday", yahrzeit: "Yahrzeit" },
  hebDate: "Hebrew date",
  family: "Family on this date",
  upcoming: "Upcoming",
  edit: "Edit",
  viewInCalendar: "Google Calendar ↗",
  nightfall: "nightfall",
  join: "Add to my list",
  joining: "Adding…",
  leave: "Leave this list",
  leaving: "Removing…",
  leaveConfirm: "Remove yourself from this anniversary?",
  rateLimited: "Google Calendar is busy right now — wait a moment and try again.",
  age: (n: number) => `turns ${n}`,
  since: (n: number) => `${ordinal(n)} yahrzeit`,
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
