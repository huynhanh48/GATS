import { Router } from 'express';

import MobilePaths from '@src/common/paths/mobile';
import CoursePaths from '@src/common/paths/course';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getUuidRouteParam } from '@src/common/utils/route-params';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import MobileBootstrapService from '@src/services/MobileBootstrapService';
import FlashcardService from '@src/services/FlashcardService';
import type { Request, Response } from 'express';

const apiRouter = Router();
const mobileRouter = Router();
const flashcardRouter = Router();
const courseFlashcardRouter = Router({ mergeParams: true });

async function bootstrap(req: Request, res: Response) {
  const timezone = req.get('x-timezone') ?? undefined;
  const result = await MobileBootstrapService.bootstrap(
    req.authUser!.id,
    timezone,
  );
  if (res.locals.requestId) {
    result.meta = {
      ...result.meta,
      requestId: res.locals.requestId as string,
    };
  }
  return res.status(HttpStatusCodes.OK).json(result);
}

async function due(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 20);
  const courseId =
    typeof req.query.courseId === 'string' && req.query.courseId.length > 0
      ? req.query.courseId
      : undefined;
  const result = await FlashcardService.due(
    req.authUser!.id,
    limit,
    courseId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function syncReviews(req: Request, res: Response) {
  const result = await FlashcardService.syncReviews(
    req.authUser!.id,
    req.body,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function stats(req: Request, res: Response) {
  const courseId =
    typeof req.query.courseId === 'string' && req.query.courseId.length > 0
      ? req.query.courseId
      : undefined;
  const result = await FlashcardService.stats(req.authUser!.id, courseId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listCourseDecks(req: Request, res: Response) {
  const courseId = getUuidRouteParam(req.params.courseId, 'courseId');
  const result = await FlashcardService.listPublishedDecksForCourse(
    req.authUser!.id,
    courseId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

mobileRouter.get(
  MobilePaths.Mobile.Bootstrap,
  errorHandle(authMiddleware),
  errorHandle(bootstrap),
);

flashcardRouter.get(
  MobilePaths.Flashcards.Due,
  errorHandle(authMiddleware),
  errorHandle(due),
);
flashcardRouter.post(
  MobilePaths.Flashcards.ReviewsSync,
  errorHandle(authMiddleware),
  errorHandle(syncReviews),
);
flashcardRouter.get(
  MobilePaths.Flashcards.Stats,
  errorHandle(authMiddleware),
  errorHandle(stats),
);

courseFlashcardRouter.get(
  '/:courseId/flashcard-decks',
  errorHandle(authMiddleware),
  errorHandle(listCourseDecks),
);

apiRouter.use(MobilePaths.Mobile._, mobileRouter);
apiRouter.use(MobilePaths.Flashcards._, flashcardRouter);
apiRouter.use(CoursePaths.Course._, courseFlashcardRouter);

export default apiRouter;
