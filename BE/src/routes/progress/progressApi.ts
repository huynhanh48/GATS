import { Router } from 'express';

import ProgressPaths from '@src/common/paths/progress';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import progressHandlers from './progressRouter';

const apiRouter = Router();
const progressRouter = Router({ mergeParams: true });

progressRouter.put(
  ProgressPaths.Progress.Lesson,
  errorHandle(authMiddleware),
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

apiRouter.use(ProgressPaths.Progress._, progressRouter);

export default apiRouter;
