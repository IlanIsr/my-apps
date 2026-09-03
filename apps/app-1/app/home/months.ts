import type { Option } from "../components/Select";

const HEBREW_DAY_LETTERS = [
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  "יא",
  "יב",
  "יג",
  "יד",
  "טו",
  "טז",
  "יז",
  "יח",
  "יט",
  "כ",
  "כא",
  "כב",
  "כג",
  "כד",
  "כה",
  "כו",
  "כז",
  "כח",
  "כט",
  "ל",
];

export const HEBREW_DAYS: Option[] = HEBREW_DAY_LETTERS.map((label, i) => ({
  key: String(i + 1),
  label,
}));

// `key` matches the keys in lib/hebcal.ts MONTH_NUMBER.
export const HEBREW_MONTHS: Option[] = [
  { key: "Tishrei", label: "תשרי" },
  { key: "Cheshvan", label: "חשוון" },
  { key: "Kislev", label: "כסלו" },
  { key: "Tevet", label: "טבת" },
  { key: "Shvat", label: "שבט" },
  { key: "Adar", label: "אדר" },
  { key: "Adar1", label: "אדר א׳" },
  { key: "Adar2", label: "אדר ב׳" },
  { key: "Nisan", label: "ניסן" },
  { key: "Iyyar", label: "אייר" },
  { key: "Sivan", label: "סיוון" },
  { key: "Tamuz", label: "תמוז" },
  { key: "Av", label: "אב" },
  { key: "Elul", label: "אלול" },
];

export const GREGORIAN_DAYS: Option[] = Array.from({ length: 31 }, (_, i) => ({
  key: String(i + 1),
  label: String(i + 1),
}));

// `key` is the 0-based month index (JS `Date` convention).
export const GREGORIAN_MONTHS: Option[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ key: String(i), label }));

export const GREGORIAN_YEARS: Option[] = Array.from(
  { length: 2100 - 1900 + 1 },
  (_, i) => {
    const year = String(1900 + i);
    return { key: year, label: year };
  },
);
