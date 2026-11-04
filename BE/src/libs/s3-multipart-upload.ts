import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  UploadPartCommand,
  type CompletedPart,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3BrowserClient, getS3Bucket, getS3Client } from '@src/libs/s3.client';

export const DEFAULT_PART_SIZE_BYTES = 64 * 1024 * 1024;
export const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_MULTIPART_PARTS = 10_000;
export const PRESIGNED_PART_URL_EXPIRES_SECONDS = 15 * 60;

function normalizeKey(key: string): string {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

export function computePartSize(fileSize: number): number {
  if (fileSize <= 0) {
    throw new Error('File size must be positive');
  }

  let partSize = DEFAULT_PART_SIZE_BYTES;
  let totalParts = Math.ceil(fileSize / partSize);

  if (totalParts > MAX_MULTIPART_PARTS) {
    partSize = Math.ceil(fileSize / MAX_MULTIPART_PARTS);
    if (partSize < MIN_PART_SIZE_BYTES) {
      partSize = MIN_PART_SIZE_BYTES;
    }
    totalParts = Math.ceil(fileSize / partSize);
  }

  if (totalParts > MAX_MULTIPART_PARTS) {
    throw new Error(
      `File too large for multipart upload (max ${MAX_MULTIPART_PARTS} parts)`,
    );
  }

  return partSize;
}

export function computeTotalParts(fileSize: number, partSize: number): number {
  return Math.ceil(fileSize / partSize);
}

export async function createMultipartUpload(
  key: string,
  contentType: string,
): Promise<string> {
  const response = await getS3Client().send(
    new CreateMultipartUploadCommand({
      Bucket: getS3Bucket(),
      Key: normalizeKey(key),
      ContentType: contentType,
    }),
  );

  if (!response.UploadId) {
    throw new Error('Failed to create multipart upload');
  }

  return response.UploadId;
}

export async function createUploadPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresInSeconds = PRESIGNED_PART_URL_EXPIRES_SECONDS,
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: getS3Bucket(),
    Key: normalizeKey(key),
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  // Sign against the browser-reachable endpoint (HTTPS on prod). Using the
  // in-cluster http://s3:9000 client here causes mixed-content blocks.
  return getSignedUrl(getS3BrowserClient(), command, {
    expiresIn: expiresInSeconds,
  });
}

export type MultipartPartInput = {
  partNumber: number;
  etag: string;
};

function normalizeEtag(etag: string): string {
  const trimmed = etag.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed;
  }
  return `"${trimmed.replace(/"/g, '')}"`;
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: MultipartPartInput[],
): Promise<void> {
  const completedParts: CompletedPart[] = [...parts]
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((part) => ({
      PartNumber: part.partNumber,
      ETag: normalizeEtag(part.etag),
    }));

  const command = new CompleteMultipartUploadCommand({
    Bucket: getS3Bucket(),
    Key: normalizeKey(key),
    UploadId: uploadId,
    MultipartUpload: { Parts: completedParts },
  });

  let lastError: any;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await getS3Client().send(command);
      return;
    } catch (error: any) {
      lastError = error;
      const is502 = error?.$metadata?.httpStatusCode === 502;
      const isXmlError = error?.message?.includes('XML parse error');
      if (is502 || isXmlError) {
        console.warn(`[completeMultipartUpload] S3 returned 502/XML error (attempt ${attempt}/4). Retrying in ${attempt}s...`);
        await new Promise((res) => setTimeout(res, attempt * 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function abortMultipartUpload(
  key: string,
  uploadId: string,
): Promise<void> {
  await getS3Client().send(
    new AbortMultipartUploadCommand({
      Bucket: getS3Bucket(),
      Key: normalizeKey(key),
      UploadId: uploadId,
    }),
  );
}

export async function listMultipartUploadParts(
  key: string,
  uploadId: string,
): Promise<CompletedPart[]> {
  const parts: CompletedPart[] = [];
  let partNumberMarker: string | undefined;

  do {
    const response = await getS3Client().send(
      new ListPartsCommand({
        Bucket: getS3Bucket(),
        Key: normalizeKey(key),
        UploadId: uploadId,
        PartNumberMarker: partNumberMarker,
      }),
    );

    for (const part of response.Parts ?? []) {
      if (part.PartNumber !== undefined && part.ETag) {
        parts.push({
          PartNumber: part.PartNumber,
          ETag: part.ETag,
        });
      }
    }

    if (response.IsTruncated && response.NextPartNumberMarker) {
      partNumberMarker = response.NextPartNumberMarker;
    } else {
      break;
    }
  } while (true);

  return parts;
}
