/**
 * The timezones a user can pick in their profile — every IANA timezone. It
 * fixes the timezone the events are shown in, and nightfall / sunset are
 * computed at that timezone's principal city (`TIMEZONE_COORDINATES`). Client-
 * safe data.
 */

import { GeoLocation, Zmanim } from "@hebcal/core";

import { TIMEZONE_COORDINATES } from "./timezones";
import { JERUSALEM, type ZmanimLocation } from "./zmanim";

/** An IANA timezone from {@link TIMEZONE_COORDINATES}, e.g. `"Europe/Paris"`. */
export type LocationId = string;

export const LOCATION_IDS: readonly LocationId[] =
  Object.keys(TIMEZONE_COORDINATES);

/** Where everyone is until they pick a timezone — what the app always used. */
export const DEFAULT_LOCATION: LocationId = "Asia/Jerusalem";

export function isLocationId(value: unknown): value is LocationId {
  return (
    typeof value === "string" && Object.hasOwn(TIMEZONE_COORDINATES, value)
  );
}

/** A stored / submitted value as a timezone, falling back to {@link DEFAULT_LOCATION}. */
export function toLocationId(value: unknown): LocationId {
  return isLocationId(value) ? value : DEFAULT_LOCATION;
}

/** Coordinates + timezone of `id` (Jerusalem keeps the app's historic point). */
export function locationOf(id: LocationId): ZmanimLocation {
  const coordinates = TIMEZONE_COORDINATES[id];
  if (id === DEFAULT_LOCATION || !coordinates) return JERUSALEM;
  return {
    latitude: String(coordinates[0]),
    longitude: String(coordinates[1]),
    timezone: id,
  };
}

function canonical(timezone: string): string | null {
  try {
    return new Intl.DateTimeFormat("en", {
      timeZone: timezone,
    }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/**
 * The timezone a browser reports (`Intl…resolvedOptions().timeZone`) as one of
 * ours — browsers may still use an old alias (`Asia/Calcutta` for
 * `Asia/Kolkata`), so both sides are canonicalised.
 */
export function locationForTimezone(timezone: string): LocationId | null {
  if (isLocationId(timezone)) return timezone;
  const wanted = canonical(timezone);
  if (!wanted) return null;
  return LOCATION_IDS.find((id) => canonical(id) === wanted) ?? null;
}

/** `"UTC+02:00"` — `id`'s current offset from UTC. */
export function utcOffsetLabel(id: LocationId, at = new Date()): string {
  try {
    const name =
      new Intl.DateTimeFormat("en-US", {
        timeZone: id,
        timeZoneName: "longOffset",
      })
        .formatToParts(at)
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    return name === "GMT" ? "UTC+00:00" : name.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

/** Minutes east of UTC right now — for sorting a timezone list. */
export function utcOffsetMinutes(id: LocationId, at = new Date()): number {
  const match = utcOffsetLabel(id, at).match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/** `"Buenos Aires"` for `"America/Argentina/Buenos_Aires"`. */
export function timezoneCity(id: LocationId): string {
  return (id.split("/").pop() ?? id).replaceAll("_", " ");
}

function hhmm(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/**
 * Tzeit hakochavim (sunset + 42 min) on `date` (ISO) at `id`, `"HH:MM"` in its
 * timezone — computed locally (no network), so it can run for every event of a
 * page. Within a minute of hebcal.com's value (what the calendar events use).
 */
export function localTzeit(date: string, id: LocationId): string {
  const loc = locationOf(id);
  const [y, m, d] = date.split("-").map(Number);
  const geo = new GeoLocation(
    null,
    Number(loc.latitude),
    Number(loc.longitude),
    0,
    loc.timezone,
  );
  const zmanim = new Zmanim(geo, new Date(y ?? 0, (m ?? 1) - 1, d ?? 1), false);
  return hhmm(zmanim.sunsetOffset(42, true), loc.timezone);
}
