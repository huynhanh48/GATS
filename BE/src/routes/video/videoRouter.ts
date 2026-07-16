import { Request, Response } from 'express';
import { unlink } from 'fs/promises';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  parseInitMultipartUploadInput,
  parseInitUploadInput,
  parseLinkVideoInput,
  parseMultipartAbortInput,
  parseMultipartCompleteInput,
  parseMultipartPartUrlInput,
  parsePlaybackParams,
  parseVideoIdParam,
} from '@src/models/Video.model';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import VideoService from '@src/services/VideoService';
import { renderTestMultipartUploadPageHtml } from './testMultipartUploadPageHtml';

async function initUpload(req: Request, res: Response) {
  const input = parseInitUploadInput(req.body);
  const result = await VideoService.initUpload(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function initMultipartUpload(req: Request, res: Response) {
  const input = parseInitMultipartUploadInput(req.body);
  const result = await VideoService.initMultipartUpload(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function getMultipartPartUrl(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const input = parseMultipartPartUrlInput(req.body);
  const result = await VideoService.getMultipartPartUrl(videoId, input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function completeMultipartUpload(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const input = parseMultipartCompleteInput(req.body);
  const result = await VideoService.completeMultipartUpload(videoId, input);
  return res.status(HttpStatusCodes.ACCEPTED).json(result);
}

async function abortMultipartUpload(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const input = parseMultipartAbortInput(req.body);
  const result = await VideoService.abortMultipartUpload(videoId, input);
  return res.status(HttpStatusCodes.OK).json(result);
}

function getTestMultipartUploadPage(_req: Request, res: Response) {
  return res.type('html').send(renderTestMultipartUploadPageHtml());
}

async function linkVideo(req: Request, res: Response) {
  const input = parseLinkVideoInput(req.body);
  const result = await VideoService.linkVideo(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function uploadFile(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const file = req.file;

  if (!file) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Video file is required');
  }

  try {
    const result = await VideoService.uploadFile(
      videoId,
      file.path,
      file.mimetype,
    );
    return res.status(HttpStatusCodes.OK).json(result);
  } finally {
    await unlink(file.path).catch(() => undefined);
  }
}

async function completeUpload(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const result = await VideoService.completeUpload(videoId);
  return res.status(HttpStatusCodes.ACCEPTED).json(result);
}

async function getStatus(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const result = await VideoService.getStatus(videoId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getByLesson(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const lessonId = getRouteParam(req.params.lessonId);
  const result = await VideoService.getByLesson(courseId, lessonId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function deleteVideo(req: Request, res: Response) {
  const videoId = parseVideoIdParam({ videoId: getRouteParam(req.params.videoId) });
  const result = await VideoService.deleteVideo(videoId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getPlayback(req: Request, res: Response) {
  const { courseId, videoId } = parsePlaybackParams({
    courseId: getRouteParam(req.params.courseId),
    videoId: getRouteParam(req.params.videoId),
  });
  const result = await VideoService.getPlayback(
    courseId,
    videoId,
    req.authUser?.id ?? null,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  initUpload: errorHandle(initUpload),
  initMultipartUpload: errorHandle(initMultipartUpload),
  getMultipartPartUrl: errorHandle(getMultipartPartUrl),
  completeMultipartUpload: errorHandle(completeMultipartUpload),
  abortMultipartUpload: errorHandle(abortMultipartUpload),
  getTestMultipartUploadPage,
  linkVideo: errorHandle(linkVideo),
  uploadFile: errorHandle(uploadFile),
  completeUpload: errorHandle(completeUpload),
  getStatus: errorHandle(getStatus),
  getByLesson: errorHandle(getByLesson),
  deleteVideo: errorHandle(deleteVideo),
  getPlayback: errorHandle(getPlayback),
} as const;
