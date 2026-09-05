/**
 * Firestore (source of truth) access for anniversaries, via the Firebase Admin
 * SDK. Server-only. Targets a **named** database (`FIREBASE_DATABASE_ID`,
 * default `app-1`), not `(default)`.
 *
 * Admin SDK — not the client SDK + security rules pattern used elsewhere in the
 * repo — because auth here is Clerk (not Firebase Auth) and every call already
 * runs inside an authenticated server action.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import {
  FieldValue,
  getFirestore,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore";

import type { HebrewMonthKey } from "@repo/hebcal";

import { anniversaryKey, type AnniversaryType } from "./person";

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("firestore-not-configured");
    this.name = "StoreNotConfiguredError";
  }
}

/** A stored event — carries bookkeeping the app-facing `AnniversaryEvent` hides. */
export type StoredEvent = {
  /** Hebrew year of the occurrence — the stable per-occurrence key. */
  year: number;
  /** Gregorian eve date, ISO `YYYY-MM-DD`. A manual edit overrides the computed one. */
  date: string;
  /** Start time `HH:MM`, or `""` meaning "use tzeit hakochavim". */
  time: string;
  /** Google Calendar event id (`""` until first sync). */
  googleEventId: string;
  /** Google Calendar event link (`""` until first sync). */
  htmlLink: string;
  /** The user hand-edited this event's date/time — don't recompute it. */
  manual?: boolean;
};

export type PersonRecord = {
  id: string;
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  hebDate: { day: number; month: HebrewMonthKey };
  key: string;
  members: string[];
  events: StoredEvent[];
  createdBy: string;
};

export type NewPerson = {
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  hebDate: { day: number; month: HebrewMonthKey };
  members: string[];
  createdBy: string;
};

export type PersonPatch = Partial<{
  hebrewName: string;
  origin: string;
  members: string[];
  events: StoredEvent[];
}>;

const COLLECTION = "persons";
const APP_NAME = "anniversaries";

let cachedDb: Firestore | null = null;

/** Names of the Firestore env vars that are missing, if any. */
export function storeConfigIssues(): string[] {
  return [
    !process.env.FIREBASE_PROJECT_ID && "FIREBASE_PROJECT_ID",
    !process.env.FIREBASE_CLIENT_EMAIL && "FIREBASE_CLIENT_EMAIL",
    !process.env.FIREBASE_PRIVATE_KEY && "FIREBASE_PRIVATE_KEY",
  ].filter((v): v is string => Boolean(v));
}

export function isStoreConfigured(): boolean {
  return storeConfigIssues().length === 0;
}

function db(): Firestore {
  if (cachedDb) return cachedDb;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new StoreNotConfiguredError();
  }
  const databaseId = process.env.FIREBASE_DATABASE_ID ?? "app-1";

  const app: App =
    getApps().find((a) => a.name === APP_NAME) ??
    initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }) },
      APP_NAME,
    );
  cachedDb = getFirestore(app, databaseId);
  return cachedDb;
}

/** The project id this deployment's Firestore lives in. */
export function currentProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID;
}

// --- reading another project's Firestore (prod → pre-prod data sync) ---

export type FirestoreCreds = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseId: string;
};

export type RawPersonDoc = { id: string; data: DocumentData };

/**
 * Read-only credentials for a *source* Firestore (production), from
 * `PROD_FIREBASE_*`. `null` unless all three are set — which is only the case
 * on the pre-prod backend, so the prod-sync feature is naturally pre-prod-only.
 */
export function prodSourceCreds(): FirestoreCreds | null {
  const projectId = process.env.PROD_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.PROD_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.PROD_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return {
    projectId,
    clientEmail,
    privateKey,
    databaseId: process.env.PROD_FIREBASE_DATABASE_ID ?? "app-1",
  };
}

const SOURCE_APP_NAME = "anniversaries-source";

function sourceDb(creds: FirestoreCreds): Firestore {
  const app: App =
    getApps().find((a) => a.name === SOURCE_APP_NAME) ??
    initializeApp(
      {
        credential: cert({
          projectId: creds.projectId,
          clientEmail: creds.clientEmail,
          privateKey: creds.privateKey,
        }),
      },
      SOURCE_APP_NAME,
    );
  return getFirestore(app, creds.databaseId);
}

/** Every `persons` document from a source Firestore, raw (timestamps intact). */
export async function listRawPersonsFrom(
  creds: FirestoreCreds,
): Promise<RawPersonDoc[]> {
  const snap = await sourceDb(creds).collection(COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

/**
 * Make this deployment's `persons` collection an exact mirror of `docs`:
 * overwrite matching ids, delete the rest. Used only by the prod-sync feature.
 */
export async function replaceAllPersons(
  docs: RawPersonDoc[],
): Promise<{ written: number; deleted: number }> {
  const col = db().collection(COLLECTION);
  const existing = await col.get();
  const keep = new Set(docs.map((d) => d.id));

  let deleted = 0;
  for (const d of existing.docs) {
    if (!keep.has(d.id)) {
      await d.ref.delete();
      deleted++;
    }
  }
  for (const d of docs) await col.doc(d.id).set(d.data);
  return { written: docs.length, deleted };
}

function toStoredEvent(raw: DocumentData): StoredEvent {
  return {
    year: Number(raw.year) || 0,
    date: String(raw.date ?? ""),
    time: String(raw.time ?? ""),
    googleEventId: String(raw.googleEventId ?? ""),
    htmlLink: String(raw.htmlLink ?? ""),
    manual: raw.manual === true ? true : undefined,
  };
}

function toRecord(id: string, data: DocumentData): PersonRecord {
  return {
    id,
    name: String(data.name ?? ""),
    type: data.type === "yahrzeit" ? "yahrzeit" : "birthday",
    hebrewName: data.hebrewName ? String(data.hebrewName) : undefined,
    origin: data.origin ? String(data.origin) : undefined,
    hebYear: Number(data.hebYear) || undefined,
    hebDate: {
      day: Number(data.hebDay) || 0,
      month: String(data.hebMonth ?? "") as HebrewMonthKey,
    },
    key: String(data.key ?? ""),
    members: Array.isArray(data.members)
      ? (data.members as unknown[]).map((m) => String(m))
      : [],
    events: Array.isArray(data.events)
      ? (data.events as DocumentData[]).map(toStoredEvent)
      : [],
    createdBy: String(data.createdBy ?? ""),
  };
}

function eventToData(e: StoredEvent): DocumentData {
  const data: DocumentData = {
    year: e.year,
    date: e.date,
    time: e.time,
    googleEventId: e.googleEventId,
    htmlLink: e.htmlLink,
  };
  if (e.manual) data.manual = true;
  return data;
}

export async function listPersons(): Promise<PersonRecord[]> {
  const snap = await db().collection(COLLECTION).get();
  return snap.docs.map((d) => toRecord(d.id, d.data()));
}

export async function getPerson(id: string): Promise<PersonRecord | null> {
  const doc = await db().collection(COLLECTION).doc(id).get();
  const data = doc.data();
  return data ? toRecord(doc.id, data) : null;
}

export async function findByKey(key: string): Promise<PersonRecord | null> {
  const snap = await db()
    .collection(COLLECTION)
    .where("key", "==", key)
    .limit(1)
    .get();
  const doc = snap.docs[0];
  return doc ? toRecord(doc.id, doc.data()) : null;
}

export async function createPerson(input: NewPerson): Promise<PersonRecord> {
  const ref = db().collection(COLLECTION).doc();
  const key = anniversaryKey(
    input.name,
    input.hebDate.day,
    input.hebDate.month,
    input.type,
  );
  const data: DocumentData = {
    name: input.name,
    type: input.type,
    key,
    hebDay: input.hebDate.day,
    hebMonth: input.hebDate.month,
    members: input.members,
    events: [],
    createdBy: input.createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.hebrewName) data.hebrewName = input.hebrewName;
  if (input.origin) data.origin = input.origin;
  if (input.hebYear) data.hebYear = input.hebYear;
  await ref.set(data);
  return {
    id: ref.id,
    name: input.name,
    type: input.type,
    hebrewName: input.hebrewName,
    origin: input.origin,
    hebYear: input.hebYear,
    hebDate: input.hebDate,
    key,
    members: input.members,
    events: [],
    createdBy: input.createdBy,
  };
}

export async function updatePerson(
  id: string,
  patch: PersonPatch,
): Promise<void> {
  const data: DocumentData = { updatedAt: FieldValue.serverTimestamp() };
  if (patch.hebrewName !== undefined) data.hebrewName = patch.hebrewName;
  if (patch.origin !== undefined) data.origin = patch.origin;
  if (patch.members !== undefined) data.members = patch.members;
  if (patch.events !== undefined) data.events = patch.events.map(eventToData);
  await db().collection(COLLECTION).doc(id).update(data);
}

export async function deletePerson(id: string): Promise<void> {
  await db().collection(COLLECTION).doc(id).delete();
}
