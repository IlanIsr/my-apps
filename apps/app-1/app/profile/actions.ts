"use server";

/**
 * `/profile` — saves the signed-in user's preferences on their `users` row.
 * Only their own row: the email comes from the session, never from the client.
 */

import { revalidatePath } from "next/cache";

import {
  CalendarRateLimitError,
  getUserFeedToken,
  markOnboardingShown,
  moveMemberSeries,
  rotateUserFeedToken,
  setUserLocation,
  setUserMinhag,
  toMinhag,
} from "@repo/anniversaries";
import { getCurrentUserEmail, getCurrentUserId } from "@repo/auth/user";
import { isLocationId, type LocationId, type Minhag } from "@repo/hebcal";

export type ProfileResult =
  { ok: true } | { ok: false; error: "not-signed-in" | "failed" };

export async function saveMinhagAction(minhag: Minhag): Promise<ProfileResult> {
  const [email, userId] = await Promise.all([
    getCurrentUserEmail(),
    getCurrentUserId(),
  ]);
  if (!email || !userId) return { ok: false, error: "not-signed-in" };
  try {
    await setUserMinhag({ email, clerkId: userId, minhag: toMinhag(minhag) });
  } catch (error) {
    console.error("[profile] saving minhag failed:", error);
    return { ok: false, error: "failed" };
  }
  // The root layout reads the minhag — re-render every page with it.
  revalidatePath("/", "layout");
  return { ok: true };
}

export type FeedTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: "not-signed-in" | "failed" };

/**
 * The signed-in user's calendar-feed token (`/feed/<token>.ics`) — created on
 * first use, or replaced when `renew` (the old feed URL then stops working).
 */
export async function feedTokenAction(
  renew: boolean,
): Promise<FeedTokenResult> {
  const [email, userId] = await Promise.all([
    getCurrentUserEmail(),
    getCurrentUserId(),
  ]);
  if (!email || !userId) return { ok: false, error: "not-signed-in" };
  try {
    const existing = renew ? null : await getUserFeedToken(email);
    const token =
      existing ?? (await rotateUserFeedToken({ email, clerkId: userId }));
    return { ok: true, token };
  } catch (error) {
    console.error("[profile] calendar feed token failed:", error);
    return { ok: false, error: "failed" };
  }
}

export type LocationResult =
  | { ok: true; personIds: string[] }
  | { ok: false; error: "not-signed-in" | "failed" };

/**
 * Saves the signed-in user's city. Returns the anniversaries they're on, each
 * to be moved to that city's calendar series with {@link moveSeriesAction}.
 */
export async function saveLocationAction(
  location: LocationId,
): Promise<LocationResult> {
  const [email, userId] = await Promise.all([
    getCurrentUserEmail(),
    getCurrentUserId(),
  ]);
  if (!email || !userId) return { ok: false, error: "not-signed-in" };
  if (!isLocationId(location)) return { ok: false, error: "failed" };
  try {
    const personIds = await setUserLocation({
      email,
      clerkId: userId,
      location,
    });
    revalidatePath("/", "layout");
    return { ok: true, personIds };
  } catch (error) {
    console.error("[profile] saving location failed:", error);
    return { ok: false, error: "failed" };
  }
}

export type MoveSeriesResult =
  | { ok: true }
  | { ok: false; error: "not-signed-in" | "rate-limited" | "failed" };

/** Moves the signed-in user to their city's series of one anniversary. */
export async function moveSeriesAction(
  personId: string,
): Promise<MoveSeriesResult> {
  const email = await getCurrentUserEmail();
  if (!email) return { ok: false, error: "not-signed-in" };
  try {
    await moveMemberSeries(personId, email);
    return { ok: true };
  } catch (error) {
    if (error instanceof CalendarRateLimitError) {
      return { ok: false, error: "rate-limited" };
    }
    console.error("[profile] moving calendar series failed:", error);
    return { ok: false, error: "failed" };
  }
}

/** The first-visit modal was seen — never show it again. */
export async function onboardingShownAction(): Promise<void> {
  const [email, userId] = await Promise.all([
    getCurrentUserEmail(),
    getCurrentUserId(),
  ]);
  if (!email || !userId) return;
  try {
    await markOnboardingShown({ email, clerkId: userId });
  } catch (error) {
    console.error("[profile] saving onboarding state failed:", error);
  }
}
