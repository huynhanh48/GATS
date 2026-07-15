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
      const ext = path.extname(file.originalname) || '.bin';
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, unique);
    },
  });
}

function createUploader(allowedMimes: Set<string>, maxBytes: number) {
  return multer({
    storage: createDiskStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimes.has(file.mimetype)) {
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
);
const fileUploader = createUploader(FILE_MIME_SET, MAX_FILE_UPLOAD_BYTES);

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
