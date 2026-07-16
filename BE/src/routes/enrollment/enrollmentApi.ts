import { Router } from 'express';

import EnrollmentPaths from '@src/common/paths/enrollment';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import enrollmentHandlers from './enrollmentRouter';

const apiRouter = Router();
const enrollmentRouter = Router({ mergeParams: true });
const meRouter = Router();

enrollmentRouter.post(
  EnrollmentPaths.Enrollment.Create,
  errorHandle(authMiddleware),
  enrollmentHandlers.enroll,
);
enrollmentRouter.get(
  EnrollmentPaths.Enrollment.List,
  errorHandle(authMiddleware),
  enrollmentHandlers.listByCourse,
);
enrollmentRouter.delete(
  EnrollmentPaths.Enrollment.Revoke,
  errorHandle(authMiddleware),
  enrollmentHandlers.revoke,
);
enrollmentRouter.patch(
  EnrollmentPaths.Enrollment.Update,
  errorHandle(authMiddleware),
  enrollmentHandlers.update,
);

meRouter.get(
  EnrollmentPaths.Me.List,
  errorHandle(authMiddleware),
  enrollmentHandlers.listMine,
);

apiRouter.use(EnrollmentPaths.Enrollment._, enrollmentRouter);
apiRouter.use(EnrollmentPaths.Me._, meRouter);

export default apiRouter;
