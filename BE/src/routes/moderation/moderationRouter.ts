import { Request, Response } from 'express';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { commentStatusEnum } from '@src/db/schema/comment';
import { errorHandle } from '@src/middleware/errorHandle';
import ModerationService from '@src/services/ModerationService';

const commentStatusSchema = z.enum(commentStatusEnum.enumValues);

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: commentStatusSchema.optional(),
});

const updateStatusSchema = z.object({
  status: commentStatusSchema,
});

function authUserId(req: Request): number | undefined {
  return req.authUser?.id;
}

async function listQueue(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const result = await ModerationService.listQueue(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function updateStatus(req: Request, res: Response) {
  const input = updateStatusSchema.parse(req.body);
  const result = await ModerationService.updateStatus(
    getRouteParam(req.params.id),
    input.status,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listQueue: errorHandle(listQueue),
  updateStatus: errorHandle(updateStatus),
};
