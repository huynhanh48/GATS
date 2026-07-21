import { Router } from 'express';

import CertificatePaths from '@src/common/paths/certificate';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireStaff from '@src/middleware/requireStaff';
import certificateHandlers from './certificateRouter';

const apiRouter = Router();
const certificateRouter = Router();

certificateRouter.get(
  CertificatePaths.Certificate.Verify,
  certificateHandlers.verify,
);

certificateRouter.get(
  CertificatePaths.Certificate.Mine,
  errorHandle(authMiddleware),
  certificateHandlers.listMine,
);

certificateRouter.get(
  CertificatePaths.Certificate.AdminList,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  certificateHandlers.adminList,
);

certificateRouter.post(
  CertificatePaths.Certificate.AdminIssue,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  certificateHandlers.adminIssue,
);

certificateRouter.post(
  CertificatePaths.Certificate.AdminRevoke,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  certificateHandlers.adminRevoke,
);

apiRouter.use(CertificatePaths.Certificate._, certificateRouter);
export default apiRouter;
