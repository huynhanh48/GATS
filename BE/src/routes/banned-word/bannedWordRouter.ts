import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateBannedWordInput,
  parseUpdateBannedWordInput,
} from '@src/models/BannedWord.model';
import BannedWordService from '@src/services/BannedWordService';

async function list(_req: Request, res: Response) {
  const result = await BannedWordService.list();
  return res.status(HttpStatusCodes.OK).json(result);
}

async function create(req: Request, res: Response) {
  const input = parseCreateBannedWordInput(req.body);
  const result = await BannedWordService.create(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function update(req: Request, res: Response) {
  const input = parseUpdateBannedWordInput(req.body);
  const result = await BannedWordService.update(
    getRouteParam(req.params.id),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function remove(req: Request, res: Response) {
  const result = await BannedWordService.remove(getRouteParam(req.params.id));
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  list: errorHandle(list),
  create: errorHandle(create),
  update: errorHandle(update),
  remove: errorHandle(remove),
} as const;
