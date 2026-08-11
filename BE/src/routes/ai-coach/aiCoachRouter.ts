import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getUuidRouteParam } from '@src/common/utils/route-params';
import {
  createAiCoachSessionSchema,
  updateAiCoachSessionSchema,
  addAiCoachMessageSchema,
  chatAiCoachSchema,
} from '@src/schemas/ai-coach-schemas';
import aiCoachService from '@src/services/ai-coach-service';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function getSessions(req: Request, res: Response) {
  const sessions = await aiCoachService.getSessions(authUserId(req));
  return res.status(HttpStatusCodes.OK).json({ data: sessions });
}

async function chat(req: Request, res: Response) {
  const parsed = chatAiCoachSchema.parse(req.body);
  const result = await aiCoachService.chat(parsed.query, parsed.domains);
  return res.status(HttpStatusCodes.OK).json({ data: result });
}

async function createSession(req: Request, res: Response) {
  const parsed = createAiCoachSessionSchema.parse(req.body);
  const session = await aiCoachService.createSession(authUserId(req), parsed);
  return res.status(HttpStatusCodes.CREATED).json({ data: session });
}

async function getSessionDetails(req: Request, res: Response) {
  const id = getUuidRouteParam(req.params.id, 'id');
  const session = await aiCoachService.getSessionDetails(id, authUserId(req));
  return res.status(HttpStatusCodes.OK).json({ data: session });
}

async function updateSession(req: Request, res: Response) {
  const id = getUuidRouteParam(req.params.id, 'id');
  const parsed = updateAiCoachSessionSchema.parse(req.body);
  const session = await aiCoachService.updateSession(
    id,
    authUserId(req),
    parsed,
  );
  return res.status(HttpStatusCodes.OK).json({ data: session });
}

async function deleteSession(req: Request, res: Response) {
  const id = getUuidRouteParam(req.params.id, 'id');
  await aiCoachService.deleteSession(id, authUserId(req));
  return res.status(HttpStatusCodes.NO_CONTENT).send();
}

async function addMessage(req: Request, res: Response) {
  const id = getUuidRouteParam(req.params.id, 'id');
  const parsed = addAiCoachMessageSchema.parse(req.body);
  const message = await aiCoachService.addMessage(id, authUserId(req), parsed);
  return res.status(HttpStatusCodes.CREATED).json({ data: message });
}

export default {
  chat,
  getSessions,
  createSession,
  getSessionDetails,
  updateSession,
  deleteSession,
  addMessage,
};
