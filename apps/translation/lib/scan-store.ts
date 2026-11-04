/**
 * The page scans, kept in this browser only (IndexedDB, keyed by page id).
 * They never reach the database: the server only receives them, per request,
 * to forward to Claude. Every call fails soft (private mode, blocked storage):
 * the workbench then shows the transcription in place of the scan.
 */

const DB_NAME = "translation-scans";
const STORE = "scans";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(request.result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return null;
  }
}

export async function putScan(pageId: string, blob: Blob): Promise<void> {
  await withStore("readwrite", (s) => s.put(blob, pageId));
}

export async function getScan(pageId: string): Promise<Blob | null> {
  const result = await withStore<unknown>("readonly", (s) => s.get(pageId));
  return result instanceof Blob ? result : null;
}

export async function deleteScans(pageIds: string[]): Promise<void> {
  await Promise.all(
    pageIds.map((id) => withStore("readwrite", (s) => s.delete(id))),
  );
}
