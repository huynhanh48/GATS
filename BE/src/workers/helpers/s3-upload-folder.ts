import { readdir, stat } from 'fs/promises';
import path from 'path';

import mime from 'mime-types';

import EnvVars from '@src/common/constants/env';
import { uploadBuffer, uploadFileFromPath } from '@src/libs/s3-storage';

const DEFAULT_UPLOAD_CONCURRENCY = 16;
const STABLE_POLL_MS = 400;

export type MasterPlaylistRendition = {
  bandwidth: number;
  width: number;
  height: number;
  playlistPath: string;
};

export async function uploadMasterPlaylist(
  storageKey: string,
  renditions: readonly MasterPlaylistRendition[],
): Promise<void> {
  if (renditions.length === 0) {
    throw new Error('Master playlist requires at least one rendition');
  }

  const content = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    ...renditions.flatMap((rendition) => [
      `#EXT-X-STREAM-INF:BANDWIDTH=${rendition.bandwidth},RESOLUTION=${rendition.width}x${rendition.height}`,
      rendition.playlistPath,
    ]),
    '',
  ].join('\n');

  await uploadBuffer(
    storageKey,
    content,
    'application/vnd.apple.mpegurl',
    'no-cache',
  );
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.m3u8') return 'application/vnd.apple.mpegurl';
  if (ext === '.ts') return 'video/mp2t';
  return mime.lookup(filePath) || 'application/octet-stream';
}

function getCacheControl(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.m3u8') return 'no-cache';
  if (ext === '.ts') return 'public, max-age=31536000, immutable';
  return 'no-cache';
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;

  let nextIndex = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const current = nextIndex;
        nextIndex += 1;
        if (current >= items.length) return;
        await worker(items[current]);
      }
    },
  );

  await Promise.all(runners);
}

function resolveUploadConcurrency(concurrency?: number): number {
  if (typeof concurrency === 'number' && concurrency > 0) return concurrency;
  const fromEnv = EnvVars.HlsUploadConcurrency;
  return fromEnv > 0 ? fromEnv : DEFAULT_UPLOAD_CONCURRENCY;
}

export async function uploadHlsDirectory(
  localDir: string,
  storagePrefix: string,
  concurrency?: number,
): Promise<void> {
  const files = await walkFiles(localDir);
  const normalizedPrefix = storagePrefix.replace(/\\/g, '/').replace(/\/$/, '');
  const limit = resolveUploadConcurrency(concurrency);

  await mapPool(files, limit, async (filePath) => {
    const relativePath = path
      .relative(localDir, filePath)
      .split(path.sep)
      .join('/');
    const key = `${normalizedPrefix}/${relativePath}`;
    await uploadFileFromPath(
      filePath,
      key,
      getContentType(filePath),
      getCacheControl(filePath),
    );
  });
}

export type HlsProgressiveUploader = {
  start: () => void;
  /** Stop polling and upload any remaining files (playlists + leftover .ts). */
  stopAndFinalize: () => Promise<void>;
  /** Stop polling; wait for in-flight only (used when encoding will be retried). */
  abort: () => Promise<void>;
  /** Test helper: paths already uploaded. */
  getUploadedPaths: () => string[];
};

/**
 * Upload `.ts` segments while FFmpeg is still writing.
 * `.m3u8` playlists are only uploaded in `stopAndFinalize` after encode succeeds.
 */
export function createHlsProgressiveUploader(options: {
  localDir: string;
  storagePrefix: string;
  concurrency?: number;
  pollIntervalMs?: number;
}): HlsProgressiveUploader {
  const localDir = options.localDir;
  const normalizedPrefix = options.storagePrefix
    .replace(/\\/g, '/')
    .replace(/\/$/, '');
  const concurrency = resolveUploadConcurrency(options.concurrency);
  const pollIntervalMs = options.pollIntervalMs ?? STABLE_POLL_MS;

  const uploaded = new Set<string>();
  const sizes = new Map<string, number>();
  const inFlight = new Set<Promise<void>>();
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;
  let activeWorkers = 0;
  const queue: string[] = [];

  const pump = () => {
    while (activeWorkers < concurrency && queue.length > 0) {
      const filePath = queue.shift()!;
      if (uploaded.has(filePath)) continue;
      activeWorkers += 1;
      const relativePath = path
        .relative(localDir, filePath)
        .split(path.sep)
        .join('/');
      const key = `${normalizedPrefix}/${relativePath}`;
      const job = uploadFileFromPath(
        filePath,
        key,
        getContentType(filePath),
        getCacheControl(filePath),
      )
        .then(() => {
          uploaded.add(filePath);
        })
        .finally(() => {
          activeWorkers -= 1;
          inFlight.delete(job);
          pump();
        });
      inFlight.add(job);
    }
  };

  const enqueueTsIfStable = async () => {
    if (stopped) return;
    let files: string[] = [];
    try {
      files = await walkFiles(localDir);
    } catch {
      return;
    }

    for (const filePath of files) {
      if (!filePath.endsWith('.ts')) continue;
      if (uploaded.has(filePath)) continue;
      if (queue.includes(filePath)) continue;

      let size = 0;
      try {
        size = (await stat(filePath)).size;
      } catch {
        continue;
      }
      if (size <= 0) continue;

      const prev = sizes.get(filePath);
      sizes.set(filePath, size);
      // Size unchanged across two polls → FFmpeg finished writing the segment.
      if (prev !== undefined && prev === size) {
        queue.push(filePath);
      }
    }
    pump();
  };

  const waitInFlight = async () => {
    while (inFlight.size > 0) {
      await Promise.allSettled([...inFlight]);
    }
  };

  return {
    start() {
      if (timer) return;
      stopped = false;
      timer = setInterval(() => {
        void enqueueTsIfStable();
      }, pollIntervalMs);
      void enqueueTsIfStable();
    },

    async abort() {
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      queue.length = 0;
      await waitInFlight();
    },

    async stopAndFinalize() {
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      // One more .ts sweep then wait
      await enqueueTsIfStable();
      await waitInFlight();

      const files = await walkFiles(localDir);
      const remaining = files.filter((f) => !uploaded.has(f));
      await mapPool(remaining, concurrency, async (filePath) => {
        if (uploaded.has(filePath)) return;
        const relativePath = path
          .relative(localDir, filePath)
          .split(path.sep)
          .join('/');
        const key = `${normalizedPrefix}/${relativePath}`;
        await uploadFileFromPath(
          filePath,
          key,
          getContentType(filePath),
          getCacheControl(filePath),
        );
        uploaded.add(filePath);
      });
    },

    getUploadedPaths() {
      return [...uploaded];
    },
  };
}

/** Pure helper for tests: which extensions upload during progressive vs finalize. */
export function progressiveUploadPhase(filePath: string): 'early' | 'finalize' {
  return filePath.endsWith('.ts') ? 'early' : 'finalize';
}
