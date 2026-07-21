import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import {
  parseGrantEnrollmentInput,
  parseUpdateEnrollmentInput,
  parseUserIdParam,
} from '@src/models/Enrollment.model';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import EnrollmentService from '@src/services/EnrollmentService';

async function enroll(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const userId = req.authUser!.id;
  const body =
    req.body && Object.keys(req.body).length > 0
      ? parseGrantEnrollmentInput(req.body)
      : undefined;
  const result = await EnrollmentService.enroll(courseId, userId, body);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function listByCourse(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const result = await EnrollmentService.listByCourse(courseId, req.authUser!.id);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listLearners(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const result = await EnrollmentService.listLearners(
    courseId,
    req.authUser!.id,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listMine(req: Request, res: Response) {
  const result = await EnrollmentService.listMine(req.authUser!.id);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function revoke(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const targetUserId = parseUserIdParam(getRouteParam(req.params.userId));
  const result = await EnrollmentService.revoke(
    courseId,
    targetUserId,
    req.authUser!.id,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function update(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const targetUserId = parseUserIdParam(getRouteParam(req.params.userId));
  const input = parseUpdateEnrollmentInput(req.body);
  const result = await EnrollmentService.updateEnrollment(
    courseId,
    targetUserId,
    req.authUser!.id,
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  enroll: errorHandle(enroll),
  listByCourse: errorHandle(listByCourse),
  listLearners: errorHandle(listLearners),
  listMine: errorHandle(listMine),
  revoke: errorHandle(revoke),
  update: errorHandle(update),
} as const;
