import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import FlashcardAdminPaths from '@src/common/paths/flashcard-admin';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requirePermission from '@src/middleware/requirePermission';
import requireStaff from '@src/middleware/requireStaff';
import FlashcardAdminService from '@src/services/FlashcardAdminService';

import flashcardAdminHandlers from './flashcardAdminRouter';

const apiRouter = Router();
const deckRouter = Router({ mergeParams: true });
const cardRouter = Router({ mergeParams: true });

const requireCourseUpdate = (courseIdParam = 'courseId') =>
  requirePermission('update', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam] ?? req.params.id;
    return typeof raw === 'string' ? raw : undefined;
  });

async function attachDeckCourseId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const deckId = String(req.params.deckId ?? '');
  const courseId = await FlashcardAdminService.resolveDeckCourseId(deckId);
  if (courseId) {
    req.params.courseId = courseId;
  }
  next();
}

async function attachCardCourseId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const cardId = String(req.params.cardId ?? '');
  const courseId = await FlashcardAdminService.resolveCardCourseId(cardId);
  if (courseId) {
    req.params.courseId = courseId;
  }
  next();
}

deckRouter.use(errorHandle(authMiddleware));
deckRouter.use(errorHandle(requireStaff));

deckRouter.patch(
  FlashcardAdminPaths.Decks.Update,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.updateDeck),
);
deckRouter.delete(
  FlashcardAdminPaths.Decks.Delete,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.archiveDeck),
);
deckRouter.get(
  FlashcardAdminPaths.Decks.Cards,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.listCards),
);
deckRouter.post(
  FlashcardAdminPaths.Decks.Cards,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.createCard),
);
deckRouter.post(
  FlashcardAdminPaths.Decks.Import,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.importCards),
);
deckRouter.get(
  FlashcardAdminPaths.Decks.AiSources,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.listAiSources),
);
deckRouter.post(
  FlashcardAdminPaths.Decks.AiGenerate,
  errorHandle(attachDeckCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.generateCardsFromArticle),
);

cardRouter.use(errorHandle(authMiddleware));
cardRouter.use(errorHandle(requireStaff));
cardRouter.patch(
  FlashcardAdminPaths.Cards.Update,
  errorHandle(attachCardCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.updateCard),
);
cardRouter.delete(
  FlashcardAdminPaths.Cards.Delete,
  errorHandle(attachCardCourseId),
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.archiveCard),
);

apiRouter.use(FlashcardAdminPaths.Decks._, deckRouter);
apiRouter.use(FlashcardAdminPaths.Cards._, cardRouter);

export default apiRouter;
