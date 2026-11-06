import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseListMediaQuery,
  parseMediaIdParam,
} from '@src/models/Media.model';
import MediaService from '@src/services/MediaService';

async function uploadThumbnail(req: Request, res: Response) {
  const media = await MediaService.uploadThumbnail(
    req.file,
    req.authUser?.id,
  );
  return res.status(HttpStatusCodes.CREATED).json({ media });
}

async function uploadFile(req: Request, res: Response) {
  const media = await MediaService.uploadFile(req.file, req.authUser?.id);
  return res.status(HttpStatusCodes.CREATED).json({ media });
}

async function list(req: Request, res: Response) {
  const query = parseListMediaQuery(req.query);
  const result = await MediaService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getOne(req: Request, res: Response) {
  const mediaId = parseMediaIdParam(req.params);
  const media = await MediaService.getById(mediaId);
  return res.status(HttpStatusCodes.OK).json({ media });
}

async function getLink(req: Request, res: Response) {
  const mediaId = parseMediaIdParam(req.params);
  const result = await MediaService.getLink(mediaId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function remove(req: Request, res: Response) {
  const mediaId = parseMediaIdParam(req.params);
  const result = await MediaService.remove(mediaId);
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  uploadThumbnail: errorHandle(uploadThumbnail),
  uploadFile: errorHandle(uploadFile),
  list: errorHandle(list),
  getOne: errorHandle(getOne),
  getLink: errorHandle(getLink),
  remove: errorHandle(remove),
} as const;
