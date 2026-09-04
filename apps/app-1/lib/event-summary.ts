/**
 * Text for the Google Calendar event title. Owned here (not a component) but
 * still part of the message tree so it's translated and server-usable.
 */
export type EventSummaryTexts = {
  birthday: (name: string) => string;
  yahrzeit: (name: string) => string;
};
