"use server";

/**
 * Server actions for the album. Each one resolves the signed-in Clerk user,
 * validates its input (`lib/validate.ts`), calls the store — which scopes every
 * query to that user's own album — and maps failures to a stable error code.
 * Mutations return the fresh album so the client can replace its state.
 */

import { getCurrentUserId, getCurrentUserName } from "@repo/auth/user";

import { DatabaseNotConfiguredError } from "@/db/client";
import {
  LIMITS,
  type Album,
  type MyShare,
  type SharedAlbum,
} from "@/lib/album-logic";
import * as store from "@/lib/store";
import * as v from "@/lib/validate";

export type ActionErrorCode =
  | store.AlbumErrorCode
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown";

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: ActionErrorCode };

class NotSignedInError extends Error {}

async function run<T>(
  fn: (ownerId: string) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) throw new NotSignedInError();
    return { ok: true, data: await fn(ownerId) };
  } catch (error) {
    if (error instanceof NotSignedInError) {
      return { ok: false, error: "not-signed-in" };
    }
    if (error instanceof store.AlbumError)
      return { ok: false, error: error.code };
    if (error instanceof v.InvalidInputError) {
      return { ok: false, error: "invalid" };
    }
    if (error instanceof DatabaseNotConfiguredError) {
      return { ok: false, error: "db-not-configured" };
    }
    console.error("[panini] action failed:", error);
    return { ok: false, error: "unknown" };
  }
}

/** Runs a mutation, then returns the user's fresh album. */
function mutate(
  fn: (ownerId: string) => Promise<unknown>,
): Promise<ActionResult<Album | null>> {
  return run(async (ownerId) => {
    await fn(ownerId);
    return store.getAlbum(ownerId);
  });
}

export async function createAlbumAction(input: {
  name: string;
  kids: string[];
  reserveName: string;
}) {
  return mutate((ownerId) => {
    if (!Array.isArray(input.kids) || input.kids.length > LIMITS.collectors) {
      throw new v.InvalidInputError("kids");
    }
    return store.createAlbum(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
      kids: input.kids.map((k) => v.text(k, "kid", LIMITS.name)),
      reserveName: v.text(input.reserveName, "reserveName", LIMITS.name),
    });
  });
}

/** Hot path (every +/− tap) — returns just the new count, not the album. */
export async function stepCountAction(
  cardId: string,
  collectorId: string,
  delta: 1 | -1,
) {
  return run((ownerId) => {
    if (delta !== 1 && delta !== -1) throw new v.InvalidInputError("delta");
    return store.stepCount(ownerId, v.id(cardId), v.id(collectorId), delta);
  });
}

export async function updateSettingsAction(input: { name: string }) {
  return mutate((ownerId) =>
    store.updateSettings(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
    }),
  );
}

export async function resetAlbumAction() {
  return mutate((ownerId) => store.resetAlbum(ownerId));
}

export async function addCollectorAction(input: {
  name: string;
  color: string;
}) {
  return mutate((ownerId) =>
    store.addCollector(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
      color: v.color(input.color),
    }),
  );
}

export async function updateCollectorAction(
  collectorId: string,
  input: { name: string; color: string },
) {
  return mutate((ownerId) =>
    store.updateCollector(ownerId, v.id(collectorId), {
      name: v.text(input.name, "name", LIMITS.name),
      color: v.color(input.color),
    }),
  );
}

export async function deleteCollectorAction(collectorId: string) {
  return mutate((ownerId) => store.deleteCollector(ownerId, v.id(collectorId)));
}

// ---------------- sharing with friends ----------------

export type FriendsData = { myShare: MyShare | null; shared: SharedAlbum[] };

async function friendsData(userId: string): Promise<FriendsData> {
  const [myShare, shared] = await Promise.all([
    store.getMyShare(userId),
    store.getSharedWithMe(userId),
  ]);
  return { myShare, shared };
}

/** Runs a sharing mutation, then returns the fresh "Amis" tab data. */
function mutateFriends(
  fn: (userId: string) => Promise<unknown>,
): Promise<ActionResult<FriendsData>> {
  return run(async (userId) => {
    await fn(userId);
    return friendsData(userId);
  });
}

export async function getFriendsAction() {
  return run(friendsData);
}

/** Starts sharing my album under `displayName`, or renames the share. */
export async function saveShareAction(displayName: string) {
  return mutateFriends((userId) =>
    store.saveShare(userId, v.text(displayName, "displayName", LIMITS.name)),
  );
}

export async function renewShareTokenAction() {
  return mutateFriends((userId) => store.renewShareToken(userId));
}

export async function deleteShareAction() {
  return mutateFriends((userId) => store.deleteShare(userId));
}

export async function removeViewerAction(viewerId: string) {
  return mutateFriends((userId) =>
    store.removeViewer(userId, v.text(viewerId, "viewerId", 100)),
  );
}

export async function leaveShareAction(albumId: string) {
  return mutateFriends((userId) => store.leaveShare(userId, v.id(albumId)));
}

/** Joins the album behind a share link; optionally shares mine back. */
export async function joinShareAction(
  token: string,
  shareBack: { name: string } | null,
) {
  return run(async (userId) => {
    const name = (await getCurrentUserName()) ?? "?";
    await store.joinShare(
      userId,
      name.slice(0, LIMITS.name),
      v.id(token, "token"),
      shareBack && { name: v.text(shareBack.name, "name", LIMITS.name) },
    );
    return null;
  });
}
