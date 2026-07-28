import { Router } from 'express';

import MobilePaths from '@src/common/paths/mobile';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import MobileBootstrapService from '@src/services/MobileBootstrapService';
import FlashcardService from '@src/services/FlashcardService';
import type { Request, Response } from 'express';

const apiRouter = Router();
const mobileRouter = Router();
const flashcardRouter = Router();

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
  const result = await FlashcardService.due(req.authUser!.id, limit);
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
  const result = await FlashcardService.stats(req.authUser!.id);
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

apiRouter.use(MobilePaths.Mobile._, mobileRouter);
apiRouter.use(MobilePaths.Flashcards._, flashcardRouter);

export default apiRouter;
