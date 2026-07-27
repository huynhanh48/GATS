import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateCourseChatMessage,
  parsePinCourseChatMessage,
} from '@src/models/CourseChat.model';
import CourseChatService from '@src/services/CourseChatService';

async function listMessages(req: Request, res: Response) {
  const result = await CourseChatService.list(
    req.authUser!.id,
    getRouteParam(req.params.courseId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function sendMessage(req: Request, res: Response) {
  const input = parseCreateCourseChatMessage(req.body);
  const result = await CourseChatService.send(
    req.authUser!.id,
    getRouteParam(req.params.courseId),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function pinMessage(req: Request, res: Response) {
  const input = parsePinCourseChatMessage(req.body);
  const result = await CourseChatService.pin(
    req.authUser!.id,
    getRouteParam(req.params.courseId),
    getRouteParam(req.params.messageId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function deleteMessage(req: Request, res: Response) {
  const result = await CourseChatService.remove(
    req.authUser!.id,
    getRouteParam(req.params.courseId),
    getRouteParam(req.params.messageId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listMessages: errorHandle(listMessages),
  sendMessage: errorHandle(sendMessage),
  pinMessage: errorHandle(pinMessage),
  deleteMessage: errorHandle(deleteMessage),
};
