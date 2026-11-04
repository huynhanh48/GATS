import path from 'path';

import { mediaKindEnum } from '@src/db/schema/media';
import { z } from 'zod';

export const mediaKindSchema = z.enum(mediaKindEnum.enumValues);

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/avif',
] as const;

export const EXTENSION_TO_IMAGE_MIME: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
};

export const ALLOWED_FILE_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  'text/markdown',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  ...ALLOWED_IMAGE_CONTENT_TYPES,
] as const;

export const EXTENSION_TO_FILE_MIME: Readonly<Record<string, string>> = {
  ...EXTENSION_TO_IMAGE_MIME,
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx':
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.zip': 'application/zip',
};

export function resolveMimeTypeFromFilename(
  filename: string,
  kind: 'thumbnail' | 'file' = 'thumbnail',
): string | null {
  const ext = path.extname(filename).toLowerCase();
  if (kind === 'thumbnail') {
    return EXTENSION_TO_IMAGE_MIME[ext] ?? null;
  }
  return EXTENSION_TO_FILE_MIME[ext] ?? null;
}

export function ensureFilenameExtension(
  filename: string,
  mimeType: string,
): string {
  if (path.extname(filename)) {
    return filename;
  }
  const cleanMime = mimeType.toLowerCase().trim();
  for (const [ext, mime] of Object.entries(EXTENSION_TO_FILE_MIME)) {
    if (mime === cleanMime) {
      return `${filename}${ext}`;
    }
  }
  return filename;
}

export const MAX_IMAGE_UPLOAD_BYTES = 30 * 1024 * 1024;
export const MAX_FILE_UPLOAD_BYTES = 500 * 1024 * 1024;

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

const UNSAFE_FILENAME_PATTERN = /[<>:"/\\|?*\u0000-\u001F\u007F]/g;

export function sanitizeFilename(filename: string): string {
  const normalized = filename.normalize('NFC').replace(/\0/g, '').trim();
  const basename = path.basename(normalized).replace(/\\/g, '/');
  const safe = basename
    .split('/')
    .pop()
    ?.replace(UNSAFE_FILENAME_PATTERN, '_')
    .replace(/[. ]+$/g, '')
    .trim();

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
