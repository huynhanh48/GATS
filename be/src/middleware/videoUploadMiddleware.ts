import { NextFunction, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  ALLOWED_VIDEO_CONTENT_TYPES,
  MAX_VIDEO_UPLOAD_BYTES,
} from '@src/models/Video.model';

const ALLOWED_MIME_SET = new Set<string>(ALLOWED_VIDEO_CONTENT_TYPES);

function getTempUploadDir(): string {
  return path.join(os.tmpdir(), 'gats-video-uploads');
}

const storage = multer.diskStorage({
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

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_SET.has(file.mimetype)) {
      cb(new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid uploaded content type'));
      return;
    }
    cb(null, true);
  },
});

export const videoUploadMiddleware = upload.single('file');

export function handleVideoUploadError(
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
          'Video file exceeds maximum allowed size',
        ),
      );
      return;
    }
    next(new RouteError(HttpStatusCodes.BAD_REQUEST, err.message));
    return;
  }

  next(err);
}
