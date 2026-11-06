import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import {
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'fs/promises';
import os from 'os';
import path from 'path';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import logger from 'jet-logger';

import EnvVars from '@src/common/constants/env';
import { getS3Bucket, getS3Client } from '@src/libs/s3.client';
import {
  createDownloadProgressBar,
  type DownloadProgressBar,
} from '@src/workers/helpers/cli-progress-bar';

function normalizeKey(key: string): string {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

export function buildPublicUrl(key: string): string {
  const normalizedKey = normalizeKey(key);
  const publicBase = EnvVars.S3PublicBaseUrl?.replace(/\/$/, '');
  if (publicBase) {
    return `${publicBase}/${normalizedKey}`;
  }

  const endpoint = EnvVars.S3Endpoint.replace(/\/$/, '');
  const bucket = getS3Bucket();
  return `${endpoint}/${bucket}/${normalizedKey}`;
}

export async function objectExistsAndSize(
  key: string,
): Promise<{ exists: boolean; size: number }> {
  try {
    const head = await getS3Client().send(
      new HeadObjectCommand({
        Bucket: getS3Bucket(),
        Key: normalizeKey(key),
      }),
    );
    return { exists: true, size: head.ContentLength ?? 0 };
  } catch (error) {
    const err = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return { exists: false, size: 0 };
    }
    throw error;
  }
}

export async function uploadFileFromPath(
  tempPath: string,
  key: string,
  contentType: string,
  cacheControl?: string,
): Promise<void> {
  const upload = new Upload({
    client: getS3Client(),
    params: {
      Bucket: getS3Bucket(),
      Key: normalizeKey(key),
      Body: createReadStream(tempPath),
      ContentType: contentType,
      ...(cacheControl ? { CacheControl: cacheControl } : {}),
    },
  });

  await upload.done();
}

export async function uploadBuffer(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  cacheControl?: string,
): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: normalizeKey(key),
      Body: body,
      ContentType: contentType,
      ...(cacheControl ? { CacheControl: cacheControl } : {}),
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getS3Bucket(),
      Key: normalizeKey(key),
    }),
  );
}

/**
 * Deletes every object under a key prefix (e.g. the HLS folder of a video).
 * Lists in pages of up to 1000 keys and batch-deletes each page.
 */
export async function deleteObjectsByPrefix(prefix: string): Promise<number> {
  const normalizedPrefix = prefix.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalizedPrefix || normalizedPrefix.includes('..')) {
    throw new Error('Invalid storage prefix');
  }

  const bucket = getS3Bucket();
  const client = getS3Client();
  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      }),
    );

    const keys = (listed.Contents ?? [])
      .map((item) => item.Key)
      .filter((key): key is string => typeof key === 'string');

    if (keys.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      deleted += keys.length;
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return deleted;
}

const DOWNLOAD_URL_EXPIRES_SECONDS = 6 * 60 * 60;
/** Custom network retries around GetObject stream (Context7 CLIENTS.md pattern). */
const DOWNLOAD_NETWORK_MAX_RETRIES = 5;
const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), 'gats-s3-downloads');

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDownloadSpeed(bytes: number, elapsedMs: number): string {
  if (elapsedMs <= 0) return '0.0 MB/s';
  return `${(bytes / 1024 / 1024 / (elapsedMs / 1000)).toFixed(2)} MB/s`;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function formatError(error: unknown): string {
  const err = toError(error) as Error & { code?: string };
  return err.code ? `${err.message} code=${err.code}` : err.message;
}

async function createDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_SECONDS },
  );
}

/** Presigned GET URL for FFmpeg HTTP input (seekable via Range). */
export async function createPresignedDownloadUrl(key: string): Promise<string> {
  return createDownloadUrl(normalizeKey(key));
}

function destroySdkBody(body: unknown): void {
  const stream = body as { destroy?: (error?: Error) => void };
  if (typeof stream?.destroy === 'function') {
    stream.destroy();
  }
}

/**
 * Open a download body stream.
 * LongVan (and some S3 clones) reject SDK GetObject with Range (SignatureDoesNotMatch),
 * but accept unsigned Range on a plain presigned GET → HTTP 206.
 */
async function openDownloadBody(params: {
  bucket: string;
  key: string;
  offset: number;
}): Promise<{ body: Readable; contentRange?: string | null }> {
  const { bucket, key, offset } = params;
  const client = getS3Client();

  if (offset <= 0) {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    if (!response.Body) {
      throw new Error('S3 GetObject returned an empty response body');
    }
    return {
      body: response.Body as Readable,
      contentRange: response.ContentRange,
    };
  }

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_SECONDS },
  );

  const response = await fetch(url, {
    headers: { Range: `bytes=${offset}-` },
  });

  if (response.status !== 206) {
    const snippet = (await response.text().catch(() => '')).slice(0, 200);
    throw new Error(
      `S3 HTTP Range resume failed: status=${response.status} (expected 206) ${snippet}`,
    );
  }
  if (!response.body) {
    throw new Error('S3 HTTP Range resume returned an empty body');
  }

  return {
    body: Readable.fromWeb(
      response.body as import('stream/web').ReadableStream<Uint8Array>,
    ),
    contentRange: response.headers.get('content-range'),
  };
}

/** Stable partial path so BullMQ job retries can resume across attempts. */
export function getDownloadPartialPaths(key: string): {
  etagPath: string;
  partialPath: string;
} {
  const hash = createHash('sha1').update(normalizeKey(key)).digest('hex');
  const partialPath = path.join(DOWNLOAD_CACHE_DIR, `${hash}.partial`);
  return { etagPath: `${partialPath}.etag`, partialPath };
}

function isRetryableNetworkError(error: unknown): boolean {
  const err = error as NodeJS.ErrnoException & {
    cause?: unknown;
    Code?: string;
  };
  const code = err.code ?? err.Code;
  if (
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNABORTED' ||
    code === 'ERR_STREAM_PREMATURE_CLOSE' ||
    code === 'TimeoutError'
  ) {
    return true;
  }
  const message = err.message ?? '';
  if (
    /aborted|ECONNRESET|ETIMEDOUT|socket hang up|premature close|idle timed out|Timeout/i.test(
      message,
    )
  ) {
    return true;
  }
  if (err.cause) return isRetryableNetworkError(err.cause);
  return false;
}

async function clearDownloadPartial(
  partialPath: string,
  etagPath: string,
): Promise<void> {
  await rm(partialPath, { force: true }).catch(() => undefined);
  await rm(etagPath, { force: true }).catch(() => undefined);
}

async function moveToDestination(
  fromPath: string,
  destinationPath: string,
): Promise<void> {
  await rm(destinationPath, { force: true }).catch(() => undefined);
  try {
    await rename(fromPath, destinationPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'EXDEV') throw error;
    await pipeline(createReadStream(fromPath), createWriteStream(destinationPath));
    await rm(fromPath, { force: true }).catch(() => undefined);
  }
}

function parseContentRangeTotal(contentRange: string | undefined): number | null {
  if (!contentRange) return null;
  const match = /bytes\s+\d+-\d+\/(\d+|\*)/i.exec(contentRange);
  if (!match || match[1] === '*') return null;
  return Number(match[1]);
}

/**
 * Download an object to disk via AWS SDK GetObject Body stream (full object).
 * Resume after network errors uses HTTP Range on a plain presigned GET (LongVan
 * rejects SDK GetObject Range with SignatureDoesNotMatch).
 */
export async function downloadObjectToFile(
  key: string,
  destinationPath: string,
): Promise<void> {
  const normalizedKey = normalizeKey(key);
  const bucket = getS3Bucket();
  const client = getS3Client();
  const { partialPath, etagPath } = getDownloadPartialPaths(normalizedKey);

  await mkdir(DOWNLOAD_CACHE_DIR, { recursive: true });
  await rm(destinationPath, { force: true }).catch(() => undefined);

  const head = await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
    }),
  );
  const totalBytes = head.ContentLength ?? 0;
  const etag = head.ETag ?? '';
  if (totalBytes <= 0) {
    throw new Error(`S3 object is empty for key: ${normalizedKey}`);
  }

  const storedEtag = await readFile(etagPath, 'utf8').catch(() => '');
  if (storedEtag && etag && storedEtag !== etag) {
    logger.info(
      `S3 download ETag changed for ${normalizedKey}, clearing partial cache`,
    );
    await clearDownloadPartial(partialPath, etagPath);
  }
  if (etag) {
    await writeFile(etagPath, etag, 'utf8');
  }

  let offset = 0;
  try {
    const existing = await stat(partialPath);
    if (existing.size > totalBytes) {
      await clearDownloadPartial(partialPath, etagPath);
    } else if (existing.size === totalBytes) {
      offset = totalBytes;
    } else if (existing.size > 0) {
      offset = existing.size;
    }
  } catch {
    offset = 0;
  }

  if (offset === totalBytes) {
    await moveToDestination(partialPath, destinationPath);
    await rm(etagPath, { force: true }).catch(() => undefined);
    logger.info(
      `S3 download cache hit for ${normalizedKey} (${formatBytes(totalBytes)})`,
    );
    return;
  }

  const startedAt = Date.now();
  logger.info(
    `Starting S3 GetObject download: ${normalizedKey} (${formatBytes(totalBytes)}${offset > 0 ? `, resume from ${formatBytes(offset)}` : ''})`,
  );

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= DOWNLOAD_NETWORK_MAX_RETRIES; attempt++) {
    let body: unknown;
    let progressBar: DownloadProgressBar | undefined;
    try {
      const opened = await openDownloadBody({
        bucket,
        key: normalizedKey,
        offset,
      });
      body = opened.body;

      const rangeTotal = parseContentRangeTotal(opened.contentRange ?? undefined);
      if (rangeTotal != null && rangeTotal !== totalBytes) {
        throw new Error(
          `S3 download ContentRange total ${rangeTotal} !== HeadObject ${totalBytes}`,
        );
      }

      if (offset > 0) {
        logger.info(
          `S3 download resume attempt ${attempt}/${DOWNLOAD_NETWORK_MAX_RETRIES}: ${normalizedKey} from ${formatBytes(offset)} (HTTP Range on presigned GET)`,
        );
      }

      let sessionWritten = 0;
      const baseOffset = offset;
      progressBar = createDownloadProgressBar(
        `S3 Download ${normalizedKey}`,
        totalBytes,
        baseOffset,
      );
      const progress = new Transform({
        transform(chunk, _encoding, callback) {
          sessionWritten += chunk.length;
          progressBar?.update(baseOffset + sessionWritten);
          callback(null, chunk);
        },
      });

      try {
        await pipeline(
          opened.body,
          progress,
          createWriteStream(partialPath, { flags: offset > 0 ? 'a' : 'w' }),
        );
      } finally {
        progressBar.stop();
        progressBar = undefined;
      }

      const onDisk = (await stat(partialPath)).size;
      if (onDisk === totalBytes) {
        await moveToDestination(partialPath, destinationPath);
        await rm(etagPath, { force: true }).catch(() => undefined);
        logger.info(
          `Finished S3 GetObject download: ${normalizedKey} in ${Date.now() - startedAt}ms (avg=${formatDownloadSpeed(totalBytes, Date.now() - startedAt)})`,
        );
        return;
      }

      if (onDisk > totalBytes) {
        await clearDownloadPartial(partialPath, etagPath);
        throw new Error(
          `S3 GetObject wrote ${onDisk} bytes, expected at most ${totalBytes}`,
        );
      }

      // Stream ended early without throwing — keep partial and retry with Range.
      offset = onDisk;
      lastError = new Error(
        `S3 GetObject incomplete: ${onDisk}/${totalBytes} bytes`,
      );
      logger.err(
        `S3 download incomplete (${formatBytes(onDisk)}/${formatBytes(totalBytes)}), will resume (attempt ${attempt}/${DOWNLOAD_NETWORK_MAX_RETRIES})`,
      );
    } catch (error) {
      progressBar?.stop();
      destroySdkBody(body);
      lastError = toError(error);

      try {
        const onDisk = (await stat(partialPath)).size;
        offset = onDisk > totalBytes ? 0 : onDisk;
        if (onDisk > totalBytes) {
          await clearDownloadPartial(partialPath, etagPath);
          offset = 0;
        }
      } catch {
        // partial missing
      }

      if (
        !isRetryableNetworkError(error) &&
        !/incomplete/i.test(lastError.message)
      ) {
        await clearDownloadPartial(partialPath, etagPath);
        throw lastError;
      }

      if (attempt >= DOWNLOAD_NETWORK_MAX_RETRIES) {
        await clearDownloadPartial(partialPath, etagPath);
        throw lastError;
      }

      logger.err(
        `S3 download retry ${attempt}/${DOWNLOAD_NETWORK_MAX_RETRIES}: ${normalizedKey} from ${formatBytes(offset)} after ${formatError(lastError)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  await clearDownloadPartial(partialPath, etagPath);
  throw lastError ?? new Error('S3 download failed');
}
