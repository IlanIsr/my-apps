import type { HebrewMonthKey } from "@repo/hebcal";

export type Messages = {
  appName: string;
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
