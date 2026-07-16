/**
 * Persist multipart upload checkpoints + File blobs so uploads can resume
 * after a hard refresh (same browser profile). Jobs keep running in-memory
 * across client-side navigations via the singleton manager.
 */

const DB_NAME = "gats-video-uploads";
const DB_VERSION = 1;
const JOBS_STORE = "jobs";
const FILES_STORE = "files";

export type PersistedPart = {
  partNumber: number;
  etag: string;
};

export type PersistedUploadJob = {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  filename: string;
  contentType: string;
  size: number;
  videoId: string;
  uploadId: string;
  partSize: number;
  totalParts: number;
  /** Sparse: only completed parts are stored */
  completedParts: PersistedPart[];
  uploadedBytes: number;
  status: "uploading" | "completing" | "error" | "aborted";
  errorMessage: string | null;
  updatedAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(JOBS_STORE)) {
        db.createObjectStore(JOBS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open IDB"));
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}

export async function putJob(job: PersistedUploadJob): Promise<void> {
  const db = await openDb();
  try {
    await idbRequest(db.transaction(JOBS_STORE, "readwrite").objectStore(JOBS_STORE).put(job));
  } finally {
    db.close();
  }
}

export async function getJob(id: string): Promise<PersistedUploadJob | undefined> {
  const db = await openDb();
  try {
    return await idbRequest(
      db.transaction(JOBS_STORE, "readonly").objectStore(JOBS_STORE).get(id),
    );
  } finally {
    db.close();
  }
}

export async function getAllJobs(): Promise<PersistedUploadJob[]> {
  const db = await openDb();
  try {
    return await idbRequest(
      db.transaction(JOBS_STORE, "readonly").objectStore(JOBS_STORE).getAll(),
    );
  } finally {
    db.close();
  }
}

export async function deleteJob(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction([JOBS_STORE, FILES_STORE], "readwrite");
    tx.objectStore(JOBS_STORE).delete(id);
    tx.objectStore(FILES_STORE).delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to delete job"));
    });
  } finally {
    db.close();
  }
}

export async function putFile(jobId: string, file: File): Promise<void> {
  const db = await openDb();
  try {
    await idbRequest(
      db.transaction(FILES_STORE, "readwrite").objectStore(FILES_STORE).put(file, jobId),
    );
  } finally {
    db.close();
  }
}

export async function getFile(jobId: string): Promise<File | undefined> {
  const db = await openDb();
  try {
    const result = await idbRequest(
      db.transaction(FILES_STORE, "readonly").objectStore(FILES_STORE).get(jobId),
    );
    return result as File | undefined;
  } finally {
    db.close();
  }
}
