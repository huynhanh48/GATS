import { NextFunction, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  ALLOWED_FILE_CONTENT_TYPES,
  ALLOWED_IMAGE_CONTENT_TYPES,
  MAX_FILE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
  resolveMimeTypeFromFilename,
} from '@src/models/Media.model';

const IMAGE_MIME_SET = new Set<string>(ALLOWED_IMAGE_CONTENT_TYPES);
const FILE_MIME_SET = new Set<string>(ALLOWED_FILE_CONTENT_TYPES);

function getTempUploadDir(): string {
  return path.join(os.tmpdir(), 'gats-media-uploads');
}

function createDiskStorage() {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        const tempDir = getTempUploadDir();
        mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (_req, file, cb) => {
      let ext = path.extname(file.originalname) || '';
      if (!ext) {
        const inferred =
          resolveMimeTypeFromFilename(file.originalname, 'file') ||
          file.mimetype ||
          '';
        if (inferred.includes('jpeg') || inferred.includes('jpg')) ext = '.jpg';
        else if (inferred.includes('png')) ext = '.png';
        else if (inferred.includes('webp')) ext = '.webp';
        else if (inferred.includes('heic')) ext = '.heic';
        else if (inferred.includes('heif')) ext = '.heif';
        else ext = '.bin';
      }
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, unique);
    },
  });
}

function normalizeUploadedMime(
  file: Express.Multer.File,
  allowedMimes: Set<string>,
  kind: 'thumbnail' | 'file',
): string {
  const current = (file.mimetype || '').toLowerCase().trim();
  if (allowedMimes.has(current)) {
    return current;
  }
  const resolved = resolveMimeTypeFromFilename(file.originalname, kind);
  if (resolved && allowedMimes.has(resolved)) {
    file.mimetype = resolved;
    return resolved;
  }
  return current;
}

function createUploader(
  allowedMimes: Set<string>,
  maxBytes: number,
  kind: 'thumbnail' | 'file',
) {
  return multer({
    storage: createDiskStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      const mime = normalizeUploadedMime(file, allowedMimes, kind);
      if (!allowedMimes.has(mime)) {
        cb(
          new RouteError(
            HttpStatusCodes.BAD_REQUEST,
            'Invalid uploaded content type',
          ),
        );
        return;
      }
      cb(null, true);
    },
  });
}

const thumbnailUploader = createUploader(
  IMAGE_MIME_SET,
  MAX_IMAGE_UPLOAD_BYTES,
  'thumbnail',
);
const fileUploader = createUploader(
  FILE_MIME_SET,
  MAX_FILE_UPLOAD_BYTES,
  'file',
);

export const thumbnailUploadMiddleware = thumbnailUploader.single('file');
export const fileUploadMiddleware = fileUploader.single('file');

export function handleMediaUploadError(
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(
        new RouteError(
          HttpStatusCodes.PAYLOAD_TOO_LARGE,
          'Uploaded file exceeds maximum allowed size',
        ),
      );
      return;
    }
    next(new RouteError(HttpStatusCodes.BAD_REQUEST, err.message));
    return;
  }

  next(err);
}
