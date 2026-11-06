import { NextFunction, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';

const AI_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      const dir = path.join(os.tmpdir(), 'gats-quiz-ai-uploads');
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: AI_UPLOAD_MAX_BYTES, files: 1 },
});

export const quizAiUploadMiddleware = upload.single('file');

export function handleQuizAiUploadError(
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
          'Uploaded file exceeds 25MB limit',
        ),
      );
      return;
    }
    next(new RouteError(HttpStatusCodes.BAD_REQUEST, err.message));
    return;
  }
  next(err);
}
