import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { parseUpsertLessonProgressInput } from '@src/models/LessonProgress.model';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import LessonProgressService from '@src/services/LessonProgressService';
import ProgressSyncService from '@src/services/ProgressSyncService';

async function upsert(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const lessonId = getRouteParam(req.params.lessonId);
  const input = parseUpsertLessonProgressInput(req.body);
  const result = await LessonProgressService.upsert(
    req.authUser!.id,
    courseId,
    lessonId,
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getLessonProgress(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const lessonId = getRouteParam(req.params.lessonId);
  const result = await LessonProgressService.getLessonProgress(
    req.authUser!.id,
    courseId,
    lessonId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getCourseProgress(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const result = await LessonProgressService.getCourseProgress(
    req.authUser!.id,
    courseId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function sync(req: Request, res: Response) {
  const result = await ProgressSyncService.sync(req.authUser!.id, req.body);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function changes(req: Request, res: Response) {
  const cursor =
    typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const result = await ProgressSyncService.changes(req.authUser!.id, cursor);
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  upsert: errorHandle(upsert),
  getLessonProgress: errorHandle(getLessonProgress),
  getCourseProgress: errorHandle(getCourseProgress),
  sync: errorHandle(sync),
  changes: errorHandle(changes),
} as const;
