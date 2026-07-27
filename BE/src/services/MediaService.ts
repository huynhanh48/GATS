import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  buildMinioPublicUrl,
  deleteObject,
  uploadFileFromPath,
} from '@src/libs/minio-storage';
import {
  ALLOWED_FILE_CONTENT_TYPES,
  ALLOWED_IMAGE_CONTENT_TYPES,
  buildMediaKey,
  MAX_FILE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
  sanitizeFilename,
  type ListMediaQuery,
  type MediaKind,
  type MediaRecord,
} from '@src/models/Media.model';
import * as MediaRepo from '@src/repos/MediaRepo';

const Errors = {
  NOT_FOUND: 'Media not found',
  FILE_REQUIRED: 'Uploaded file is required',
  INVALID_CONTENT_TYPE: 'Invalid uploaded content type',
  FILE_TOO_LARGE: 'Uploaded file exceeds maximum allowed size',
} as const;

type UploadedMulterFile = {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
};

const IMAGE_MIME_SET = new Set<string>(ALLOWED_IMAGE_CONTENT_TYPES);
const FILE_MIME_SET = new Set<string>(ALLOWED_FILE_CONTENT_TYPES);

/** Rebuild public URL from storageKey so MINIO_PUBLIC_BASE_URL changes apply to old rows. */
function withFreshUrl(media: MediaRecord): MediaRecord {
  return {
    ...media,
    url: buildMinioPublicUrl(media.storageKey),
  };
}

async function uploadMedia(
  kind: MediaKind,
  file: UploadedMulterFile | undefined,
  userId: number | undefined,
): Promise<MediaRecord> {
  if (!file) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.FILE_REQUIRED);
  }

  const allowed =
    kind === 'thumbnail' ? IMAGE_MIME_SET : FILE_MIME_SET;
  const maxBytes =
    kind === 'thumbnail' ? MAX_IMAGE_UPLOAD_BYTES : MAX_FILE_UPLOAD_BYTES;

  if (!allowed.has(file.mimetype)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_CONTENT_TYPE,
    );
  }

  if (file.size > maxBytes) {
    throw new RouteError(
      HttpStatusCodes.PAYLOAD_TOO_LARGE,
      Errors.FILE_TOO_LARGE,
    );
  }

  const mediaId = randomUUID();
  const filename = sanitizeFilename(file.originalname);
  const storageKey = buildMediaKey(kind, mediaId, filename);

  try {
    await uploadFileFromPath(file.path, storageKey, file.mimetype);
    const url = buildMinioPublicUrl(storageKey);

    return await MediaRepo.create({
      id: mediaId,
      kind,
      originalName: filename,
      storageKey,
      mimeType: file.mimetype,
      size: file.size,
      url,
      uploadedBy: userId ?? null,
    });
  } catch (error) {
    await deleteObject(storageKey).catch(() => undefined);
    throw error;
  } finally {
    await unlink(file.path).catch(() => undefined);
  }
}

async function uploadThumbnail(
  file: UploadedMulterFile | undefined,
  userId: number | undefined,
): Promise<MediaRecord> {
  return uploadMedia('thumbnail', file, userId);
}

async function uploadFile(
  file: UploadedMulterFile | undefined,
  userId: number | undefined,
): Promise<MediaRecord> {
  return uploadMedia('file', file, userId);
}

async function list(
  query: ListMediaQuery,
): Promise<{ data: MediaRecord[]; total: number }> {
  const result = await MediaRepo.list(query);
  return {
    data: result.data.map(withFreshUrl),
    total: result.total,
  };
}

async function getById(id: string): Promise<MediaRecord> {
  const media = await MediaRepo.findById(id);
  if (!media) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return withFreshUrl(media);
}

async function getLink(id: string): Promise<{ id: string; url: string }> {
  const media = await getById(id);
  return { id: media.id, url: media.url };
}

async function remove(id: string): Promise<{ message: string }> {
  const existing = await MediaRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await deleteObject(existing.storageKey).catch(() => undefined);
  await MediaRepo.remove(id);

  return { message: 'Media deleted' };
}

export default {
  Errors,
  uploadThumbnail,
  uploadFile,
  list,
  getById,
  getLink,
  remove,
};
