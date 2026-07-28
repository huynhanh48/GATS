import type { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getUuidRouteParam } from '@src/common/utils/route-params';
import FlashcardAdminService from '@src/services/FlashcardAdminService';

async function listDecks(req: Request, res: Response) {
  const courseId = getUuidRouteParam(req.params.courseId, 'courseId');
  const includeArchived =
    req.query.includeArchived === 'true' || req.query.includeArchived === '1';
  const result = await FlashcardAdminService.listDecks(courseId, {
    includeArchived,
  });
  return res.status(HttpStatusCodes.OK).json(result);
}

async function createDeck(req: Request, res: Response) {
  const courseId = getUuidRouteParam(req.params.courseId, 'courseId');
  const result = await FlashcardAdminService.createDeck(courseId, req.body);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateDeck(req: Request, res: Response) {
  const deckId = getUuidRouteParam(req.params.deckId, 'deckId');
  const result = await FlashcardAdminService.updateDeck(deckId, req.body);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function archiveDeck(req: Request, res: Response) {
  const deckId = getUuidRouteParam(req.params.deckId, 'deckId');
  const result = await FlashcardAdminService.archiveDeck(deckId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listCards(req: Request, res: Response) {
  const deckId = getUuidRouteParam(req.params.deckId, 'deckId');
  const includeArchived =
    req.query.includeArchived === 'true' || req.query.includeArchived === '1';
  const result = await FlashcardAdminService.listCards(deckId, {
    includeArchived,
  });
  return res.status(HttpStatusCodes.OK).json(result);
}

async function createCard(req: Request, res: Response) {
  const deckId = getUuidRouteParam(req.params.deckId, 'deckId');
  const result = await FlashcardAdminService.createCard(deckId, req.body);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function importCards(req: Request, res: Response) {
  const deckId = getUuidRouteParam(req.params.deckId, 'deckId');
  const result = await FlashcardAdminService.importCards(deckId, req.body);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateCard(req: Request, res: Response) {
  const cardId = getUuidRouteParam(req.params.cardId, 'cardId');
  const result = await FlashcardAdminService.updateCard(cardId, req.body);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function archiveCard(req: Request, res: Response) {
  const cardId = getUuidRouteParam(req.params.cardId, 'cardId');
  const result = await FlashcardAdminService.archiveCard(cardId);
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listDecks,
  createDeck,
  updateDeck,
  archiveDeck,
  listCards,
  createCard,
  importCards,
  updateCard,
  archiveCard,
};
