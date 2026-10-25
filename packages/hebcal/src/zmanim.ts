/**
 * Tzeit hakochavim (nightfall — 42 minutes after sunset, the common halachic
 * practice) and shkia (sunset) for a given date, from hebcal.com's zmanim API.
 */

export type ZmanimLocation = {
  latitude: string;
  longitude: string;
  /** IANA timezone, e.g. "Asia/Jerusalem". */
  timezone: string;
};

export const JERUSALEM: ZmanimLocation = {
  latitude: "31.7683",
  longitude: "35.2137",
  timezone: "Asia/Jerusalem",
};

const ZMANIM_URL = "https://www.hebcal.com/zmanim";

/**
 * One zman from hebcal.com (`tzeit42min`, `sunset`, …) on `dateStr`.
 * @param dateStr ISO `YYYY-MM-DD`
 * @returns `"HH:MM"` in the location's timezone, or `null` on failure.
 */
async function getZman(
  key: string,
  dateStr: string,
  location: ZmanimLocation,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      cfg: "json",
      latitude: location.latitude,
      longitude: location.longitude,
      tzid: location.timezone,
      date: dateStr,
    });

    const response = await fetch(`${ZMANIM_URL}?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      times?: Record<string, string>;
    };
    const iso = data.times?.[key];
    if (!iso) return null;

    // "2026-12-03T17:17:00+02:00" → "17:17"
    return iso.split("T")[1]?.slice(0, 5) ?? null;
  } catch {
    return null;
  }
}

/**
 * @param dateStr ISO `YYYY-MM-DD`
 * @returns `"HH:MM"` in the location's timezone, or `null` on failure.
 */
export function getTsetHakohavim(
  dateStr: string,
  location: ZmanimLocation = JERUSALEM,
): Promise<string | null> {
  return getZman("tzeit42min", dateStr, location);
}

/** Shkia (sunset) on `dateStr` — `"HH:MM"`, or `fallback` on failure. */
export async function getShkiaWithFallback(
  dateStr: string,
  fallback = "17:00",
  location: ZmanimLocation = JERUSALEM,
): Promise<string> {
  return (await getZman("sunset", dateStr, location)) ?? fallback;
}

/** Like {@link getTsetHakohavim} but returns `fallback` instead of `null`. */
export async function getTsetHakohavimWithFallback(
  dateStr: string,
  fallback = "18:00",
  location: ZmanimLocation = JERUSALEM,
): Promise<string> {
  return (await getTsetHakohavim(dateStr, location)) ?? fallback;
}
