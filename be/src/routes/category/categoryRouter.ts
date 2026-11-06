import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateCategoryInput,
  parseListCategoriesQuery,
  parseReorderCategoriesInput,
  parseUpdateCategoryInput,
} from '@src/models/Category.model';
import CategoryService from '@src/services/CategoryService';

async function list(req: Request, res: Response) {
  const query = parseListCategoriesQuery(req.query);
  const result = await CategoryService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function create(req: Request, res: Response) {
  const input = parseCreateCategoryInput(req.body);
  const category = await CategoryService.create(input);
  return res.status(HttpStatusCodes.CREATED).json({ category });
}

async function update(req: Request, res: Response) {
  const input = parseUpdateCategoryInput(req.body);
  const category = await CategoryService.update(
    getRouteParam(req.params.categoryId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json({ category });
}

async function remove(req: Request, res: Response) {
  const result = await CategoryService.remove(
    getRouteParam(req.params.categoryId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function reorder(req: Request, res: Response) {
  const input = parseReorderCategoriesInput(req.body);
  await CategoryService.reorder(input.type, input.items);
  return res.status(HttpStatusCodes.OK).json({ success: true });
}

export default {
  list: errorHandle(list),
  create: errorHandle(create),
  update: errorHandle(update),
  remove: errorHandle(remove),
  reorder: errorHandle(reorder),
} as const;
