import { Router } from 'express';

import AdminMetricsPaths from '@src/common/paths/admin-metrics';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireStaff from '@src/middleware/requireStaff';
import handlers from './adminMetricsRouter';

const apiRouter = Router();
const adminMetricsRouter = Router();

adminMetricsRouter.get(
  AdminMetricsPaths.AdminMetrics.Get,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.getMetrics,
);

apiRouter.use(AdminMetricsPaths.AdminMetrics._, adminMetricsRouter);
export default apiRouter;
