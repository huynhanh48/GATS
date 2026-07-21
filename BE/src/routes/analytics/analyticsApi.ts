import { Router } from 'express';

import AnalyticsPaths from '@src/common/paths/analytics';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireStaff from '@src/middleware/requireStaff';
import analyticsHandlers from './analyticsRouter';

const apiRouter = Router();
const analyticsRouter = Router();

analyticsRouter.get(
  AnalyticsPaths.Analytics.Overview,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  analyticsHandlers.getOverview,
);

apiRouter.use(AnalyticsPaths.Analytics._, analyticsRouter);
export default apiRouter;
