import { Request, Response } from 'express';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import AdminUserService from '@src/services/AdminUserService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(200).optional(),
  verified: z
    .union([z.literal('1'), z.literal('0'), z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === '1' || v === 'true';
    }),
  locked: z
    .union([z.literal('1'), z.literal('0'), z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === '1' || v === 'true';
    }),
});

async function listUsers(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const result = await AdminUserService.listUsers(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getUser(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid id' });
  }
  const result = await AdminUserService.getUser(id);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function resendVerification(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  const result = await AdminUserService.resendVerification(id, authUserId(req));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function sendPasswordReset(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  const result = await AdminUserService.sendPasswordReset(id, authUserId(req));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function revokeSessions(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  const reason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : undefined;
  const result = await AdminUserService.revokeSessions(
    id,
    authUserId(req),
    reason,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function lockUser(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  const reason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : undefined;
  const result = await AdminUserService.setLocked(
    id,
    true,
    authUserId(req),
    reason,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function unlockUser(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  const reason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : undefined;
  const result = await AdminUserService.setLocked(
    id,
    false,
    authUserId(req),
    reason,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

const updateRoleBodySchema = z.object({
  role: z.enum(['user', 'admin']),
});

async function updateRole(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid id' });
  }
  const { role } = updateRoleBodySchema.parse(req.body);
  const result = await AdminUserService.updateGlobalRole(
    id,
    role,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

const assignMentorBodySchema = z.object({
  courseId: z.string().uuid(),
});

async function assignMentorCourse(req: Request, res: Response) {
  const id = Number(getRouteParam(req.params.id));
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Invalid id' });
  }
  const { courseId } = assignMentorBodySchema.parse(req.body);
  const result = await AdminUserService.assignMentorCourse(
    id,
    courseId,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listUsers: errorHandle(listUsers),
  getUser: errorHandle(getUser),
  resendVerification: errorHandle(resendVerification),
  sendPasswordReset: errorHandle(sendPasswordReset),
  revokeSessions: errorHandle(revokeSessions),
  lockUser: errorHandle(lockUser),
  unlockUser: errorHandle(unlockUser),
  updateRole: errorHandle(updateRole),
  assignMentorCourse: errorHandle(assignMentorCourse),
};
