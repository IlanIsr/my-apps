/**
 * Album persistence (Neon / Drizzle). Server-only. Every function takes the
 * signed-in Clerk user id and only ever touches that user's album — callers
 * never pass an album id, so one user can't reach another's data. Inputs are
 * assumed already validated (see `lib/validate.ts`).
 */

import "server-only";

import { and, asc, eq, gt, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  albumShares,
  albums,
  cardCounts,
  cards,
  collectors,
  pageRewards,
  shareViewers,
} from "@/db/schema";

import {
  COLLECTOR_COLORS,
  LIMITS,
  RESERVE_COLOR,
  shareSummary,
  sortCards,
  type Album,
  type MyShare,
  type RewardKind,
  type SharedAlbum,
  type SharePreview,
} from "./album-logic";
import { ALBUM_CARDS } from "./album-cards";

export type AlbumErrorCode =
  | "no-album"
  | "album-exists"
  | "not-found"
  | "too-many-collectors"
  | "own-share";

/** An expected, user-facing failure. Mapped to an error code by the actions. */
export class AlbumError extends Error {
  constructor(public readonly code: AlbumErrorCode) {
    super(code);
    this.name = "AlbumError";
  }
}

async function albumIdOf(ownerId: string): Promise<string> {
  const [row] = await db()
    .select({ id: albums.id })
    .from(albums)
    .where(eq(albums.ownerId, ownerId));
  if (!row) throw new AlbumError("no-album");
  return row.id;
}

export async function getAlbum(ownerId: string): Promise<Album | null> {
  const [album] = await db()
    .select()
    .from(albums)
    .where(eq(albums.ownerId, ownerId));
  return album ? loadAlbum(album) : null;
}

/** Everything in one album. Only call with an album the caller may read. */
async function loadAlbum(album: { id: string; name: string }): Promise<Album> {
  const [collectorRows, cardRows, countRows, rewardRows] = await db().batch([
    db()
      .select()
      .from(collectors)
      .where(eq(collectors.albumId, album.id))
      .orderBy(asc(collectors.isReserve), asc(collectors.position)),
    db().select().from(cards).where(eq(cards.albumId, album.id)),
    db()
      .select({
        cardId: cardCounts.cardId,
        collectorId: cardCounts.collectorId,
        count: cardCounts.count,
      })
      .from(cardCounts)
      .innerJoin(cards, eq(cards.id, cardCounts.cardId))
      .where(and(eq(cards.albumId, album.id), gt(cardCounts.count, 0))),
    db().select().from(pageRewards).where(eq(pageRewards.albumId, album.id)),
  ]);

  const countsByCard = new Map<string, Record<string, number>>();
  for (const row of countRows) {
    const counts = countsByCard.get(row.cardId) ?? {};
    counts[row.collectorId] = row.count;
    countsByCard.set(row.cardId, counts);
  }

  return {
    name: album.name,
    collectors: collectorRows.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      isReserve: c.isReserve,
    })),
    cards: sortCards(
      cardRows.map((c) => ({
        id: c.id,
        code: c.code,
        page: c.page,
        label: c.label,
        counts: countsByCard.get(c.id) ?? {},
      })),
    ),
    rewards: rewardRows.map((r) => ({
      page: r.page,
      prize: r.prize,
      kind: r.kind as RewardKind,
      deadline: r.deadline,
      winners: r.winners,
      tiers: r.tiers,
    })),
  };
}

/** Creates the album, its kids + reserve, and the fixed card list. Atomic. */
export async function createAlbum(
  ownerId: string,
  input: {
    name: string;
    kids: string[];
    reserveName: string;
  },
): Promise<void> {
  const [existing] = await db()
    .select({ id: albums.id })
    .from(albums)
    .where(eq(albums.ownerId, ownerId));
  if (existing) throw new AlbumError("album-exists");

  const albumId = crypto.randomUUID();
  const cardRows = ALBUM_CARDS.map((c) => ({ albumId, ...c }));
  await db().batch([
    db().insert(albums).values({
      id: albumId,
      ownerId,
      name: input.name,
      // Legacy column (numbered-card generation) — unused since the list is fixed.
      cardsPerPage: 0,
    }),
    db()
      .insert(collectors)
      .values([
        ...input.kids.map((name, i) => ({
          albumId,
          name,
          color: COLLECTOR_COLORS[i % COLLECTOR_COLORS.length]!,
          position: i,
        })),
        {
          albumId,
          name: input.reserveName,
          color: RESERVE_COLOR,
          position: 0,
          isReserve: true,
        },
      ]),
    db().insert(cards).values(cardRows),
  ]);
}

/**
 * Adds `delta` (±1) copies, clamped at 0, in one atomic statement — two devices
 * tapping at once both count. Returns the new count.
 */
export async function stepCount(
  ownerId: string,
  cardId: string,
  collectorId: string,
  delta: 1 | -1,
): Promise<number> {
  const result = await db().execute<{ count: number }>(sql`
    INSERT INTO card_counts (card_id, collector_id, count)
    SELECT c.id, k.id, GREATEST(0, ${delta}::int)
    FROM cards c
    JOIN albums a ON a.id = c.album_id
    JOIN collectors k ON k.album_id = a.id
    WHERE c.id = ${cardId} AND k.id = ${collectorId} AND a.owner_id = ${ownerId}
    ON CONFLICT (card_id, collector_id)
    DO UPDATE SET count = GREATEST(0, card_counts.count + ${delta}::int)
    RETURNING count
  `);
  const row = result.rows[0];
  if (!row) throw new AlbumError("not-found");
  return Number(row.count);
}

export async function updateSettings(
  ownerId: string,
  input: { name: string },
): Promise<void> {
  const updated = await db()
    .update(albums)
    .set({ name: input.name })
    .where(eq(albums.ownerId, ownerId))
    .returning({ id: albums.id });
  if (!updated.length) throw new AlbumError("no-album");
}

/** Deletes the album and everything in it (cascade). */
export async function resetAlbum(ownerId: string): Promise<void> {
  await db().delete(albums).where(eq(albums.ownerId, ownerId));
}

// ---------------- collectors (kids) ----------------

export async function addCollector(
  ownerId: string,
  input: { name: string; color: string },
): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  const kids = await db()
    .select({ position: collectors.position })
    .from(collectors)
    .where(
      and(eq(collectors.albumId, albumId), eq(collectors.isReserve, false)),
    );
  if (kids.length >= LIMITS.collectors) {
    throw new AlbumError("too-many-collectors");
  }
  const position = kids.reduce((max, k) => Math.max(max, k.position + 1), 0);
  await db()
    .insert(collectors)
    .values({ albumId, position, ...input });
}

/** Renames / recolours a kid. The reserve can't be edited. */
export async function updateCollector(
  ownerId: string,
  collectorId: string,
  input: { name: string; color: string },
): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  const updated = await db()
    .update(collectors)
    .set(input)
    .where(
      and(
        eq(collectors.id, collectorId),
        eq(collectors.albumId, albumId),
        eq(collectors.isReserve, false),
      ),
    )
    .returning({ id: collectors.id });
  if (!updated.length) throw new AlbumError("not-found");
}

/** Removes a kid and their counts. The reserve can't be removed. */
export async function deleteCollector(
  ownerId: string,
  collectorId: string,
): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  await db()
    .delete(collectors)
    .where(
      and(
        eq(collectors.id, collectorId),
        eq(collectors.albumId, albumId),
        eq(collectors.isReserve, false),
      ),
    );
}

// ---------------- page rewards ----------------

// ---------------- sharing with friends ----------------
//
// A friend never reads another album through these functions except as the
// `shareSummary` aggregate, and only for albums whose `share_viewers` lists
// them. The link token is the only way in, besides "share back" (see
// `joinShare`).

export async function getMyShare(ownerId: string): Promise<MyShare | null> {
  const albumId = await albumIdOf(ownerId);
  const [[share], viewers] = await db().batch([
    db().select().from(albumShares).where(eq(albumShares.albumId, albumId)),
    db()
      .select({
        viewerId: shareViewers.viewerId,
        name: shareViewers.viewerName,
      })
      .from(shareViewers)
      .where(eq(shareViewers.albumId, albumId))
      .orderBy(asc(shareViewers.joinedAt)),
  ]);
  if (!share) return null;
  return { token: share.token, displayName: share.displayName, viewers };
}

/** Starts sharing my album, or renames it if it already is. */
export async function saveShare(
  ownerId: string,
  displayName: string,
): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  await db()
    .insert(albumShares)
    .values({ albumId, displayName })
    .onConflictDoUpdate({ target: albumShares.albumId, set: { displayName } });
}

/** A new link: the old one stops working, friends who joined stay. */
export async function renewShareToken(ownerId: string): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  await db()
    .update(albumShares)
    .set({ token: sql`gen_random_uuid()` })
    .where(eq(albumShares.albumId, albumId));
}

/** Stops sharing: the link dies and every friend loses access. */
export async function deleteShare(ownerId: string): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  await db().delete(albumShares).where(eq(albumShares.albumId, albumId));
}

export async function removeViewer(
  ownerId: string,
  viewerId: string,
): Promise<void> {
  const albumId = await albumIdOf(ownerId);
  await db()
    .delete(shareViewers)
    .where(
      and(
        eq(shareViewers.albumId, albumId),
        eq(shareViewers.viewerId, viewerId),
      ),
    );
}

/** What the share link's page shows before joining. */
export async function getSharePreview(
  token: string,
  viewerId: string,
): Promise<SharePreview | null> {
  const [share] = await db()
    .select({
      albumId: albumShares.albumId,
      displayName: albumShares.displayName,
      ownerId: albums.ownerId,
    })
    .from(albumShares)
    .innerJoin(albums, eq(albums.id, albumShares.albumId))
    .where(eq(albumShares.token, token));
  if (!share) return null;

  const [[joined], [mine], [back]] = await db().batch([
    db()
      .select({ id: shareViewers.viewerId })
      .from(shareViewers)
      .where(
        and(
          eq(shareViewers.albumId, share.albumId),
          eq(shareViewers.viewerId, viewerId),
        ),
      ),
    db()
      .select({ id: albums.id, shareName: albumShares.displayName })
      .from(albums)
      .leftJoin(albumShares, eq(albumShares.albumId, albums.id))
      .where(eq(albums.ownerId, viewerId)),
    db()
      .select({ id: shareViewers.viewerId })
      .from(shareViewers)
      .innerJoin(albums, eq(albums.id, shareViewers.albumId))
      .where(
        and(
          eq(albums.ownerId, viewerId),
          eq(shareViewers.viewerId, share.ownerId),
        ),
      ),
  ]);
  return {
    displayName: share.displayName,
    isOwn: share.ownerId === viewerId,
    joined: Boolean(joined),
    sharedBack: Boolean(back),
    viewerHasAlbum: Boolean(mine),
    viewerShareName: mine?.shareName ?? null,
  };
}

/**
 * Adds the viewer to the album behind `token`. With `shareBack`, also shares
 * the viewer's own album with that album's owner (starting the viewer's share
 * under `backName` if there's none yet) — the one case where someone gets
 * access without opening a link: the person who sent the link.
 */
export async function joinShare(
  viewerId: string,
  viewerName: string,
  token: string,
  shareBack: { name: string } | null,
): Promise<void> {
  const [share] = await db()
    .select({
      albumId: albumShares.albumId,
      displayName: albumShares.displayName,
      ownerId: albums.ownerId,
    })
    .from(albumShares)
    .innerJoin(albums, eq(albums.id, albumShares.albumId))
    .where(eq(albumShares.token, token));
  if (!share) throw new AlbumError("not-found");
  if (share.ownerId === viewerId) throw new AlbumError("own-share");

  const join = db()
    .insert(shareViewers)
    .values({ albumId: share.albumId, viewerId, viewerName })
    .onConflictDoNothing();
  if (!shareBack) {
    await join;
    return;
  }

  const myAlbumId = await albumIdOf(viewerId);
  await db().batch([
    join,
    db()
      .insert(albumShares)
      .values({ albumId: myAlbumId, displayName: shareBack.name })
      .onConflictDoNothing(),
    db()
      .insert(shareViewers)
      .values({
        albumId: myAlbumId,
        viewerId: share.ownerId,
        viewerName: share.displayName,
      })
      .onConflictDoNothing(),
  ]);
}

/** Drops a shared album from my "Partagés avec moi" list. */
export async function leaveShare(
  viewerId: string,
  albumId: string,
): Promise<void> {
  await db()
    .delete(shareViewers)
    .where(
      and(
        eq(shareViewers.albumId, albumId),
        eq(shareViewers.viewerId, viewerId),
      ),
    );
}

/** Every album shared with me, as aggregates. */
export async function getSharedWithMe(
  viewerId: string,
): Promise<SharedAlbum[]> {
  const shares = await db()
    .select({
      albumId: albumShares.albumId,
      name: albumShares.displayName,
    })
    .from(shareViewers)
    .innerJoin(albumShares, eq(albumShares.albumId, shareViewers.albumId))
    .innerJoin(albums, eq(albums.id, albumShares.albumId))
    .where(
      and(eq(shareViewers.viewerId, viewerId), ne(albums.ownerId, viewerId)),
    )
    .orderBy(asc(albumShares.displayName));
  if (!shares.length) return [];

  const albumRows = await db()
    .select({ id: albums.id, name: albums.name })
    .from(albums)
    .where(
      inArray(
        albums.id,
        shares.map((s) => s.albumId),
      ),
    );
  const loaded = await Promise.all(albumRows.map(loadAlbum));
  const byId = new Map(albumRows.map((a, i) => [a.id, loaded[i]!]));

  return shares.flatMap((s) => {
    const album = byId.get(s.albumId);
    return album
      ? [{ albumId: s.albumId, name: s.name, ...shareSummary(album) }]
      : [];
  });
}
