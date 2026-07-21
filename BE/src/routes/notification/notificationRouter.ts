import { Request, Response } from 'express';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { errorHandle } from '@src/middleware/errorHandle';
import NotificationService from '@src/services/NotificationService';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  unreadOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
  source: z.enum(['system', 'admin']).optional(),
});

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
});

const composeSchema = z.object({
  title: z.string().trim().min(3).max(255),
  body: z.string().trim().max(2000).optional(),
  href: z.string().trim().max(500).optional(),
  audienceLabel: z.string().trim().max(100).optional(),
});

async function list(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const result = await NotificationService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function markRead(req: Request, res: Response) {
  const body = markReadSchema.parse(req.body ?? {});
  const result = await NotificationService.markRead(body.ids);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function compose(req: Request, res: Response) {
  const body = composeSchema.parse(req.body ?? {});
  const result = await NotificationService.compose(body, req.authUser!.id);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

export default {
  list: errorHandle(list),
  markRead: errorHandle(markRead),
  compose: errorHandle(compose),
};
