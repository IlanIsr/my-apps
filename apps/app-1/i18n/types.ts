import type { HebrewMonthKey } from "@repo/hebcal";

import type { AnniversaryMessages } from "./messages/en/anniversary";
import type { CalendarMessages } from "./messages/en/calendar";

export type Messages = {
  appName: string;
  /** Anniversary manager (Google Calendar feature). */
  anniversary: AnniversaryMessages;
  calendar: CalendarMessages;
  home: {
    question: string;
    gregorian: string;
    hebrew: string;
    /** aria-label for the Gregorian/Hebrew input toggle. */
    toggleCalendar: string;
  };
  hebrewForm: {
    day: string;
    month: string;
    calculate: string;
    /** Label before the resulting Gregorian date. */
    nextGregorianDate: string;
    noSuchDate: string;
  };
  gregorianForm: {
    day: string;
    month: string;
    year: string;
    calculate: string;
    invalidDate: string;
  };
  /** Localized label for each Hebrew month key. */
  hebrewMonths: Record<HebrewMonthKey, string>;
  theme: { toggle: string };
  language: { label: string };
};
