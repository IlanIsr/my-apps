/**
 * Read-only access to the **production Firestore** `persons` collection, for the
 * one-time Neon migration and its verification script. Firebase is a
 * *migration-only* dependency (devDependency) — nothing under `src/` imports it.
 *
 * Credentials come from env, in order of preference:
 *   PROD_FIREBASE_PROJECT_ID / PROD_FIREBASE_CLIENT_EMAIL / PROD_FIREBASE_PRIVATE_KEY
 *   MIGRATE_FIREBASE_* (same three)
 *   FIREBASE_* (same three)
 * Project id defaults to the prod project `my-app-1-312d0`, database to `app-1`.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type DocumentData } from "firebase-admin/firestore";

import { anniversaryKey, type AnniversaryType } from "../../src/person";
import type { PersonRecord, StoredEvent } from "../../src/store";

const APP_NAME = "anniversaries-firestore-source";
const DEFAULT_PROJECT_ID = "my-app-1-312d0";
const DEFAULT_DATABASE_ID = "app-1";

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
}

export function firestoreSourceInfo(): {
  projectId: string;
  clientEmail: string;
  databaseId: string;
} | null {
  const clientEmail = pick(
    "PROD_FIREBASE_CLIENT_EMAIL",
    "MIGRATE_FIREBASE_CLIENT_EMAIL",
    "FIREBASE_CLIENT_EMAIL",
  );
  const privateKey = pick(
    "PROD_FIREBASE_PRIVATE_KEY",
    "MIGRATE_FIREBASE_PRIVATE_KEY",
    "FIREBASE_PRIVATE_KEY",
  );
  if (!clientEmail || !privateKey) return null;
  return {
    projectId:
      pick(
        "PROD_FIREBASE_PROJECT_ID",
        "MIGRATE_FIREBASE_PROJECT_ID",
        "FIREBASE_PROJECT_ID",
      ) ?? DEFAULT_PROJECT_ID,
    clientEmail,
    databaseId:
      pick(
        "PROD_FIREBASE_DATABASE_ID",
        "MIGRATE_FIREBASE_DATABASE_ID",
        "FIREBASE_DATABASE_ID",
      ) ?? DEFAULT_DATABASE_ID,
  };
}

function sourceDb() {
  const info = firestoreSourceInfo();
  const privateKey = pick(
    "PROD_FIREBASE_PRIVATE_KEY",
    "MIGRATE_FIREBASE_PRIVATE_KEY",
    "FIREBASE_PRIVATE_KEY",
  )?.replace(/\\n/g, "\n");
  if (!info || !privateKey) {
    throw new Error(
      "Firestore source credentials not set. Provide PROD_FIREBASE_PROJECT_ID / " +
        "PROD_FIREBASE_CLIENT_EMAIL / PROD_FIREBASE_PRIVATE_KEY (or the MIGRATE_ / " +
        "FIREBASE_ equivalents).",
    );
  }
  const app: App =
    getApps().find((a) => a.name === APP_NAME) ??
    initializeApp(
      {
        credential: cert({
          projectId: info.projectId,
          clientEmail: info.clientEmail,
          privateKey,
        }),
      },
      APP_NAME,
    );
  return getFirestore(app, info.databaseId);
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

/** Map a raw Firestore `persons/{id}` doc to a `PersonRecord`. */
export function docToRecord(id: string, data: DocumentData): PersonRecord {
  const type: AnniversaryType =
    data.type === "yahrzeit" ? "yahrzeit" : "birthday";
  const hebDay = Number(data.hebDay) || 0;
  const hebMonth = String(data.hebMonth ?? "");
  return {
    id,
    name: String(data.name ?? ""),
    type,
    hebrewName: data.hebrewName ? String(data.hebrewName) : undefined,
    origin: data.origin ? String(data.origin) : undefined,
    hebYear: Number(data.hebYear) || undefined,
    hebDate: {
      day: hebDay,
      month: hebMonth as PersonRecord["hebDate"]["month"],
    },
    key: data.key
      ? String(data.key)
      : anniversaryKey(String(data.name ?? ""), hebDay, hebMonth, type),
    members: Array.isArray(data.members)
      ? [
          ...new Set(
            (data.members as unknown[]).map((m) => String(m).toLowerCase()),
          ),
        ]
      : [],
    events: Array.isArray(data.events)
      ? (data.events as DocumentData[]).map(toStoredEvent)
      : [],
    createdBy: String(data.createdBy ?? ""),
  };
}

/** Every `persons` document from the production Firestore, as `PersonRecord`s. */
export async function listFirestorePersons(): Promise<PersonRecord[]> {
  const snap = await sourceDb().collection("persons").get();
  return snap.docs.map((d) => docToRecord(d.id, d.data()));
}
