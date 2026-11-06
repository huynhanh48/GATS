import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateTagInput,
  parseListTagsQuery,
  parseUpdateTagInput,
  reorderTagsSchema,
} from '@src/models/Tag.model';
import TagService from '@src/services/TagService';

async function list(req: Request, res: Response) {
  const query = parseListTagsQuery(req.query);
  const result = await TagService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function create(req: Request, res: Response) {
  const input = parseCreateTagInput(req.body);
  const tag = await TagService.create(input);
  return res.status(HttpStatusCodes.CREATED).json({ tag });
}

async function update(req: Request, res: Response) {
  const input = parseUpdateTagInput(req.body);
  const tag = await TagService.update(getRouteParam(req.params.tagId), input);
  return res.status(HttpStatusCodes.OK).json({ tag });
}

async function remove(req: Request, res: Response) {
  const result = await TagService.remove(getRouteParam(req.params.tagId));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function reorder(req: Request, res: Response) {
  const input = reorderTagsSchema.parse(req.body);
  await TagService.reorder(input.type, input.items);
  return res.status(HttpStatusCodes.OK).json({ success: true });
}

export default {
  list: errorHandle(list),
  create: errorHandle(create),
  update: errorHandle(update),
  remove: errorHandle(remove),
  reorder: errorHandle(reorder),
} as const;
