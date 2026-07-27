import { createReadStream } from 'fs';

import {
  DeleteObjectCommand,
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

export function buildMinioPublicUrl(key: string): string {
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
): Promise<void> {
  const upload = new Upload({
    client: getMinioClient(),
    params: {
      Bucket: getMinioBucket(),
      Key: normalizeKey(key),
      Body: createReadStream(tempPath),
      ContentType: contentType,
      // Open in browser tab (PDF/images) instead of forcing download.
      ContentDisposition: 'inline',
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
  await getMinioClient().send(
    new PutObjectCommand({
      Bucket: getMinioBucket(),
      Key: normalizeKey(key),
      Body: body,
      ContentType: contentType,
      ContentDisposition: 'inline',
      ...(cacheControl ? { CacheControl: cacheControl } : {}),
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getMinioClient().send(
    new DeleteObjectCommand({
      Bucket: getMinioBucket(),
      Key: normalizeKey(key),
    }),
  );
}
