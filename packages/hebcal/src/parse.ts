/** Gregorian/Hebrew date string parsing helpers. */

/** Format a Gregorian y/m/d as ISO `YYYY-MM-DD`. */
export function formatGregorianDateISO(
  year: number,
  month: number,
  day: number,
): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parse a Gregorian date from `YYYY-MM-DD` or `DD/MM/YYYY` (or `YYYY/MM/DD`). */
export function parseGregorianDate(
  dateStr: string,
): { year: number; month: number; day: number } | null {
  const s = dateStr.trim();

  if (s.includes("-")) {
    const [y, m, d] = s.split("-");
    if (y && m && d) {
      return { year: Number(y), month: Number(m), day: Number(d) };
    }
  }

  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length === 3) {
      const [a, b, c] = parts as [string, string, string];
      // `YYYY/MM/DD` if the last part is 4 digits, else `DD/MM/YYYY`.
      return c.length === 4
        ? { year: Number(c), month: Number(b), day: Number(a) }
        : { year: Number(a), month: Number(b), day: Number(c) };
    }
  }

  return null;
}

/** Parse a Hebrew date from `"24 Kislev"` (day + month name). */
export function parseHebrewDate(
  dateStr: string,
): { day: number; month: string } | null {
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const day = Number(parts[0]);
  const month = parts.slice(1).join(" ").trim();
  if (!Number.isInteger(day) || day < 1 || day > 30 || !month) return null;

  return {
    day,
    month: month.charAt(0).toUpperCase() + month.slice(1),
  };
}
