import { Router } from 'express';

import LeadPaths from '@src/common/paths/lead';
import authMiddleware from '@src/middleware/authMiddleware';
import { simpleRateLimit } from '@src/middleware/simpleRateLimit';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import leadHandlers from './leadRouter';

const apiRouter = Router();
const leadRouter = Router();

const leadCreateLimit = simpleRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
});

leadRouter.get(
  LeadPaths.Lead.List,
  errorHandle(authMiddleware),
  leadHandlers.list,
);

leadRouter.get(
  LeadPaths.Lead.ExportCsv,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  leadHandlers.adminExportLeadsCsv,
);

leadRouter.get(
  LeadPaths.Lead.Get,
  errorHandle(authMiddleware),
  leadHandlers.getById,
);

leadRouter.patch(
  LeadPaths.Lead.Update,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  leadHandlers.update,
);

leadRouter.post(LeadPaths.Lead.Create, leadCreateLimit, leadHandlers.create);

apiRouter.use(LeadPaths.Lead._, leadRouter);
export default apiRouter;
