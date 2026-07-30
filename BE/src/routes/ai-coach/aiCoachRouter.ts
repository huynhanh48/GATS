import { Request, Response } from 'express';
import aiCoachService from '@src/services/ai-coach-service';
import {
  createAiCoachSessionSchema,
  updateAiCoachSessionSchema,
  addAiCoachMessageSchema,
} from '@src/schemas/ai-coach-schemas';

async function getSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sessions = await aiCoachService.getSessions(userId);
  return res.json({ data: sessions });
}

async function createSession(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parsed = createAiCoachSessionSchema.parse(req.body);
  const session = await aiCoachService.createSession(userId, parsed);
  return res.status(201).json({ data: session });
}

async function getSessionDetails(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const session = await aiCoachService.getSessionDetails(id, userId);
  return res.json({ data: session });
}

async function updateSession(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const parsed = updateAiCoachSessionSchema.parse(req.body);
  const session = await aiCoachService.updateSession(id, userId, parsed);
  return res.json({ data: session });
}

async function deleteSession(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  await aiCoachService.deleteSession(id, userId);
  return res.status(204).send();
}

async function addMessage(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const parsed = addAiCoachMessageSchema.parse(req.body);
  const message = await aiCoachService.addMessage(id, userId, parsed);
  return res.status(201).json({ data: message });
}

export default {
  getSessions,
  createSession,
  getSessionDetails,
  updateSession,
  deleteSession,
  addMessage,
};
