import { Router } from 'express';

import ProgressPaths from '@src/common/paths/progress';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';
import progressHandlers from './progressRouter';

const apiRouter = Router();
const progressRouter = Router({ mergeParams: true });
const syncRouter = Router();

progressRouter.put(
  ProgressPaths.Progress.Lesson,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('progress.upsert')),
  progressHandlers.upsert,
);
progressRouter.get(
  ProgressPaths.Progress.Lesson,
  errorHandle(authMiddleware),
  progressHandlers.getLessonProgress,
);
progressRouter.get(
  ProgressPaths.Progress.CourseAggregate,
  errorHandle(authMiddleware),
  progressHandlers.getCourseProgress,
);

syncRouter.post(
  ProgressPaths.Sync.Batch,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('progress.sync')),
  progressHandlers.sync,
);
syncRouter.get(
  ProgressPaths.Sync.Changes,
  errorHandle(authMiddleware),
  progressHandlers.changes,
);

apiRouter.use(ProgressPaths.Progress._, progressRouter);
apiRouter.use(ProgressPaths.Sync._, syncRouter);

export default apiRouter;
