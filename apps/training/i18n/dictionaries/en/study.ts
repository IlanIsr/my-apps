import type { LexiconTexts } from "@/app/components/LexiconView";
import type { NoteFormTexts } from "@/app/components/NoteFormView";
import type { NotesTexts } from "@/app/components/NotesView";
import type { PlanFormTexts } from "@/app/components/PlanFormView";
import type { PlanTexts } from "@/app/components/PlanView";
import type { StudyTexts } from "@/app/components/StudyView";

const passage = {
  masekhet: "Masekhet",
  portion: "Portion",
  whole: "The whole masekhet",
  custom: "Custom range",
  perek: "Perek",
  from: "From",
  to: "To",
};

export const study = {
  eyebrow: "Study",
  title: "My study plans",
  newPlan: "New plan",
  today: "Today",
  next: "Next session {date}",
  done: "Finished",
  progress: "{studied}/{total} amudim",
  behind: "{count} amud(im) behind",
  ahead: "{count} amud(im) ahead",
  onTrack: "On track",
  empty: {
    title: "No study plan",
    description:
      "Pick a masekhet, a pace and your study days: the app gives you the day-by-day programme.",
  },
} as const satisfies StudyTexts;

export const planForm = {
  eyebrow: "Study",
  title: "New study plan",
  subject: "Subject",
  subjects: { gemara: "Gemara" },
  passage,
  rhythm: "Rhythm",
  byPace: "Per session",
  byDate: "By end date",
  pace: "Amount per session",
  paceOption: "{amudim} amud(im) · {dapim} daf",
  endDate: "End date",
  days: "Study days",
  startDate: "Start",
  summaryPace: "{sessions} session(s) — ends on {end}.",
  summaryDate:
    "{sessions} session(s) — about {perSession} amud(im) per session.",
  summaryTooShort: "No session before that date.",
  noDays: "Pick at least one day.",
  submit: "Create the plan",
  cancel: "Cancel",
} as const satisfies PlanFormTexts;

export const plan = {
  eyebrow: "Study plan",
  back: "My study plans",
  today: "Today",
  nextSession: "Next session — {date}",
  nothingToday: "Nothing left to study in this plan.",
  markAll: "Mark all as studied",
  writeNote: "Write a note",
  lexicon: "Lexicon",
  endsOn: "Ends on {date}",
  catchUp:
    "You're behind: what's left is spread over the sessions up to the end date.",
  shift: "Move the end to {date}",
  coming: "Coming sessions",
  showAll: "Show all ({count})",
  showLess: "Show less",
  byPerek: "By perek",
  perek: "Perek",
  notes: "Notes",
  noNotes: "No note on this passage yet.",
  editRhythm: "Change the rhythm",
  delete: "Delete",
  rhythm: {
    title: "Rhythm",
    byPace: "Per session",
    byDate: "By end date",
    pace: "Amount per session (from today)",
    paceOption: "{amudim} amud(im) · {dapim} daf",
    endDate: "End date",
    days: "Study days",
    save: "Save",
    cancel: "Cancel",
  },
  deleteConfirm: {
    title: "Delete this plan?",
    description: "Its progress is lost. Notes are kept.",
    cancel: "Cancel",
    confirm: "Delete",
  },
} as const satisfies PlanTexts;

export const notes = {
  eyebrow: "Study",
  title: "Notes",
  newNote: "New note",
  search: "Search the notes…",
  untitled: "Untitled",
  noMatch: "No note matches.",
  empty: {
    title: "No notes",
    description:
      "Write a summary from a plan's session of the day, or a note on any passage.",
  },
} as const satisfies NotesTexts;

export const noteForm = {
  eyebrow: "Note",
  newTitle: "New note",
  editTitle: "Note",
  passage,
  title: "Title",
  titlePlaceholder: "E.g. The time for Kriat Shema",
  content: "Summary",
  editor: {
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strikethrough",
    heading: "Heading",
    subheading: "Subheading",
    bulletList: "Bullet list",
    orderedList: "Numbered list",
    size: "Text size",
    sizes: { small: "Small", normal: "Normal", large: "Large", huge: "Huge" },
    color: "Text colour",
    highlight: "Highlight",
    none: "none",
  },
  save: "Save",
  saved: "Saved",
  backToPlan: "Back to the plan",
  delete: "Delete",
  deleteConfirm: {
    title: "Delete this note?",
    description: "It will be lost for good.",
    cancel: "Cancel",
    confirm: "Delete",
  },
} as const satisfies NoteFormTexts;

export const lexicon = {
  eyebrow: "Lexicon",
  title: "Lexicon",
  terms: "{count} term(s)",
  allAmudim: "All amudim ({count})",
  amud: "Amud",
  search: "Search a term or a translation…",
  add: "Add a term",
  addHere: "Add",
  edit: "Edit",
  delete: "Delete",
  emptyAmud: "No term on {amud}.",
  noMatch: "No term matches.",
  abbreviation: "Abbreviation",
  abbreviationsOnly: "Abbreviations only",
  abbreviations: {
    link: "All abbreviations",
    title: "Abbreviations",
    description:
      "Every abbreviation in your lexicon, all masekhtot together, in alphabetical order.",
    empty:
      "No abbreviation yet — tick “It’s an abbreviation” when adding a term.",
  },
  empty: {
    title: "Empty lexicon",
    description:
      "Write down the words and phrases of each amud with your own translation.",
  },
  form: {
    newTitle: "New term",
    editTitle: "Edit the term",
    term: "Term",
    termPlaceholder: "E.g. תיובתא",
    translation: "My translation",
    note: "Note (optional)",
    isAbbreviation: "It’s an abbreviation (ר״ת)",
    save: "Save",
    saveAndNext: "Save and add another",
    cancel: "Cancel",
  },
  deleteConfirm: {
    title: "Delete this term?",
    cancel: "Cancel",
    confirm: "Delete",
  },
} as const satisfies LexiconTexts;
