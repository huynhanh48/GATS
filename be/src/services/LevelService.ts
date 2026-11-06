import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { Level, UpdateLevelInput } from '@src/models/Level.model';
import * as LevelRepo from '@src/repos/LevelRepo';

async function list(): Promise<{ data: Level[] }> {
  return { data: await LevelRepo.findAll() };
}

async function update(code: Level['code'], input: UpdateLevelInput): Promise<Level> {
  const level = await LevelRepo.update(code, input);
  if (!level) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Level not found');
  return level;
}

export default { list, update };
