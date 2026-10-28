/**
 * The reference cities a user can pick in their profile. A city fixes both the
 * timezone the events are shown in and where nightfall / sunset are computed
 * (a timezone alone spans thousands of kilometres — Miami and New York share
 * one but not their sunset). Client-safe data.
 */

import { GeoLocation, Zmanim } from "@hebcal/core";

import type { ZmanimLocation } from "./zmanim";

export const LOCATIONS = {
  jerusalem: {
    latitude: "31.7683",
    longitude: "35.2137",
    timezone: "Asia/Jerusalem",
  },
  paris: { latitude: "48.8566", longitude: "2.3522", timezone: "Europe/Paris" },
  marseille: {
    latitude: "43.2965",
    longitude: "5.3698",
    timezone: "Europe/Paris",
  },
  london: {
    latitude: "51.5074",
    longitude: "-0.1278",
    timezone: "Europe/London",
  },
  brussels: {
    latitude: "50.8503",
    longitude: "4.3517",
    timezone: "Europe/Brussels",
  },
  geneva: {
    latitude: "46.2044",
    longitude: "6.1432",
    timezone: "Europe/Zurich",
  },
  rome: { latitude: "41.9028", longitude: "12.4964", timezone: "Europe/Rome" },
  madrid: {
    latitude: "40.4168",
    longitude: "-3.7038",
    timezone: "Europe/Madrid",
  },
  berlin: { latitude: "52.52", longitude: "13.405", timezone: "Europe/Berlin" },
  moscow: {
    latitude: "55.7558",
    longitude: "37.6173",
    timezone: "Europe/Moscow",
  },
  casablanca: {
    latitude: "33.5731",
    longitude: "-7.5898",
    timezone: "Africa/Casablanca",
  },
  johannesburg: {
    latitude: "-26.2041",
    longitude: "28.0473",
    timezone: "Africa/Johannesburg",
  },
  newYork: {
    latitude: "40.7128",
    longitude: "-74.006",
    timezone: "America/New_York",
  },
  miami: {
    latitude: "25.7617",
    longitude: "-80.1918",
    timezone: "America/New_York",
  },
  montreal: {
    latitude: "45.5019",
    longitude: "-73.5674",
    timezone: "America/Toronto",
  },
  chicago: {
    latitude: "41.8781",
    longitude: "-87.6298",
    timezone: "America/Chicago",
  },
  losAngeles: {
    latitude: "34.0522",
    longitude: "-118.2437",
    timezone: "America/Los_Angeles",
  },
  mexico: {
    latitude: "19.4326",
    longitude: "-99.1332",
    timezone: "America/Mexico_City",
  },
  saoPaulo: {
    latitude: "-23.5505",
    longitude: "-46.6333",
    timezone: "America/Sao_Paulo",
  },
  buenosAires: {
    latitude: "-34.6037",
    longitude: "-58.3816",
    timezone: "America/Argentina/Buenos_Aires",
  },
  sydney: {
    latitude: "-33.8688",
    longitude: "151.2093",
    timezone: "Australia/Sydney",
  },
} as const satisfies Record<string, ZmanimLocation>;

export type LocationId = keyof typeof LOCATIONS;

export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];

/** Where everyone is until they pick a city — what the app always used. */
export const DEFAULT_LOCATION: LocationId = "jerusalem";

export function isLocationId(value: unknown): value is LocationId {
  return typeof value === "string" && Object.hasOwn(LOCATIONS, value);
}

/** A stored / submitted value as a city, falling back to {@link DEFAULT_LOCATION}. */
export function toLocationId(value: unknown): LocationId {
  return isLocationId(value) ? value : DEFAULT_LOCATION;
}

/** The first city in a browser's timezone (`Intl…resolvedOptions().timeZone`), if any. */
export function locationForTimezone(timezone: string): LocationId | null {
  return LOCATION_IDS.find((id) => LOCATIONS[id].timezone === timezone) ?? null;
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
  const loc = LOCATIONS[id];
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
