import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { levelCodeSchema, updateLevelSchema } from '@src/models/Level.model';
import LevelService from '@src/services/LevelService';

async function list(_req: Request, res: Response) {
  return res.status(HttpStatusCodes.OK).json(await LevelService.list());
}

async function update(req: Request, res: Response) {
  const code = levelCodeSchema.parse(getRouteParam(req.params.code));
  const level = await LevelService.update(code, updateLevelSchema.parse(req.body));
  return res.status(HttpStatusCodes.OK).json({ level });
}

export default { list, update };
