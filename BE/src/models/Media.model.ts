import path from 'path';

import { mediaKindEnum } from '@src/db/schema/media';
import { z } from 'zod';

export const mediaKindSchema = z.enum(mediaKindEnum.enumValues);

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_FILE_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/markdown',
  'text/plain',
  ...ALLOWED_IMAGE_CONTENT_TYPES,
] as const;

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_UPLOAD_BYTES = 50 * 1024 * 1024;

export const mediaRecordSchema = z.object({
  id: z.string().uuid(),
  kind: mediaKindSchema,
  originalName: z.string().min(1).max(255),
  storageKey: z.string().min(1).max(512),
  mimeType: z.string().min(1).max(128),
  size: z.number().int().nonnegative(),
  url: z.string().min(1).max(1024),
  uploadedBy: z.number().int().positive().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  kind: mediaKindSchema.optional(),
});

export const mediaIdParamSchema = z.object({
  mediaId: z.string().uuid(),
});

export type MediaRecord = z.infer<typeof mediaRecordSchema>;
export type MediaKind = z.infer<typeof mediaKindSchema>;
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;

export function parseMediaRecord(data: unknown): MediaRecord {
  return mediaRecordSchema.parse(data);
}

export function parseListMediaQuery(data: unknown): ListMediaQuery {
  return listMediaQuerySchema.parse(data);
}

export function parseMediaIdParam(data: unknown): string {
  return mediaIdParamSchema.parse(data).mediaId;
}

const UNSAFE_FILENAME_PATTERN = /[^a-zA-Z0-9._-]/g;

export function sanitizeFilename(filename: string): string {
  const normalized = filename.replace(/\0/g, '').trim();
  const basename = path.basename(normalized).replace(/\\/g, '/');
  const safe = basename
    .split('/')
    .pop()
    ?.replace(UNSAFE_FILENAME_PATTERN, '_')
    .replace(/^_+|_+$/g, '');

  if (!safe || safe === '.' || safe === '..') {
    throw new Error('Invalid filename');
  }

  return safe;
}

export function buildMediaKey(
  kind: MediaKind,
  mediaId: string,
  filename: string,
): string {
  const folder = kind === 'thumbnail' ? 'thumbnails' : 'files';
  return `${folder}/${mediaId}/${filename}`;
}
