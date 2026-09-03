/**
 * Tzeit hakochavim (nightfall — 42 minutes after sunset, the common halachic
 * practice) for a given date, from hebcal.com's zmanim API.
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
 * @param dateStr ISO `YYYY-MM-DD`
 * @returns `"HH:MM"` in the location's timezone, or `null` on failure.
 */
export async function getTsetHakohavim(
  dateStr: string,
  location: ZmanimLocation = JERUSALEM,
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
    const iso = data.times?.tzeit42min;
    if (!iso) return null;

    // "2026-12-03T17:17:00+02:00" → "17:17"
    return iso.split("T")[1]?.slice(0, 5) ?? null;
  } catch {
    return null;
  }
}

/** Like {@link getTsetHakohavim} but returns `fallback` instead of `null`. */
export async function getTsetHakohavimWithFallback(
  dateStr: string,
  fallback = "18:00",
  location: ZmanimLocation = JERUSALEM,
): Promise<string> {
  return (await getTsetHakohavim(dateStr, location)) ?? fallback;
}
