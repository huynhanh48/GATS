import { createReadStream, existsSync } from 'fs';
import { copyFile, mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import logger from 'jet-logger';

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import EnvVars from '@src/common/constants/env';
import { getMinioBucket, getMinioClient } from '@src/libs/minio.client';

function normalizeKey(key: string): string {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

let bucketEnsured = false;
export async function ensureBucketExists(): Promise<void> {
  if (bucketEnsured) return;
  const client = getMinioClient();
  const bucket = getMinioBucket();
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    bucketEnsured = true;
  } catch (err: unknown) {
    const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (
      error?.name === 'NotFound' ||
      error?.name === 'NoSuchBucket' ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicRead',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        });
        await client.send(
          new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }),
        );
        bucketEnsured = true;
      } catch (createErr) {
        logger.warn(`MinIO bucket creation skipped: ${createErr}`);
      }
    } else {
      throw err;
    }
  }
}

function getLocalFilePath(key: string): string {
  const normalizedKey = normalizeKey(key.replace(/^local:/, ''));
  let publicDir = path.resolve(__dirname, '..', 'public');
  if (!existsSync(publicDir)) {
    const cwdSrc = path.resolve(process.cwd(), 'src', 'public');
    if (existsSync(cwdSrc)) {
      publicDir = cwdSrc;
    } else {
      const cwdDist = path.resolve(process.cwd(), 'dist', 'public');
      if (existsSync(cwdDist)) {
        publicDir = cwdDist;
      }
    }
  }
  return path.join(publicDir, 'uploads', normalizedKey);
}

export function buildMinioPublicUrl(key: string): string {
  if (key.startsWith('local:')) {
    const normalized = normalizeKey(key.slice('local:'.length));
    const base = (EnvVars.AppUrl || 'http://localhost:3000').replace(/\/$/, '');
    return `${base}/uploads/${normalized}`;
  }

  const normalizedKey = normalizeKey(key);
  const publicBase = EnvVars.MinioPublicBaseUrl?.replace(/\/$/, '');
  if (publicBase) {
    return `${publicBase}/${normalizedKey}`;
  }

  const endpoint = EnvVars.MinioEndpoint.replace(/\/$/, '');
  const bucket = getMinioBucket();
  return `${endpoint}/${bucket}/${normalizedKey}`;
}

export async function uploadFileFromPath(
  tempPath: string,
  key: string,
  contentType: string,
): Promise<{ storageKey: string; url: string }> {
  const normalizedKey = normalizeKey(key);

  // 1. Try MinIO first
  try {
    await ensureBucketExists();

    const upload = new Upload({
      client: getMinioClient(),
      params: {
        Bucket: getMinioBucket(),
        Key: normalizedKey,
        Body: createReadStream(tempPath),
        ContentType: contentType,
        ContentDisposition: 'inline',
      },
    });

    await upload.done();
    return {
      storageKey: normalizedKey,
      url: buildMinioPublicUrl(normalizedKey),
    };
  } catch (minioErr) {
    logger.warn(
      `MinIO storage unreachable (${(minioErr as Error)?.message}). Falling back to local disk storage.`,
    );

    // 2. Fallback to local public/uploads
    const localKey = `local:${normalizedKey}`;
    const destinationPath = getLocalFilePath(localKey);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(tempPath, destinationPath);

    return {
      storageKey: localKey,
      url: buildMinioPublicUrl(localKey),
    };
  }
}

export async function uploadBuffer(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  cacheControl?: string,
): Promise<{ storageKey: string; url: string }> {
  const normalizedKey = normalizeKey(key);

  try {
    await ensureBucketExists();
    await getMinioClient().send(
      new PutObjectCommand({
        Bucket: getMinioBucket(),
        Key: normalizedKey,
        Body: body,
        ContentType: contentType,
        ContentDisposition: 'inline',
        ...(cacheControl ? { CacheControl: cacheControl } : {}),
      }),
    );
    return {
      storageKey: normalizedKey,
      url: buildMinioPublicUrl(normalizedKey),
    };
  } catch (minioErr) {
    logger.warn(
      `MinIO storage unreachable (${(minioErr as Error)?.message}). Falling back to local disk storage.`,
    );
    const localKey = `local:${normalizedKey}`;
    const destinationPath = getLocalFilePath(localKey);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, body);
    return {
      storageKey: localKey,
      url: buildMinioPublicUrl(localKey),
    };
  }
}

export async function deleteObject(key: string): Promise<void> {
  if (key.startsWith('local:')) {
    const localPath = getLocalFilePath(key);
    await unlink(localPath).catch(() => undefined);
    return;
  }

  try {
    await getMinioClient().send(
      new DeleteObjectCommand({
        Bucket: getMinioBucket(),
        Key: normalizeKey(key),
      }),
    );
  } catch {
    // Ignore deletion errors on remote
  }
}
