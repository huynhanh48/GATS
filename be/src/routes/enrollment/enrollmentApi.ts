import { Router } from 'express';

import EnrollmentPaths from '@src/common/paths/enrollment';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';
import {
  authenticatedUserRateKey,
  redisRateLimit,
} from '@src/middleware/redisRateLimit';
import enrollmentHandlers from './enrollmentRouter';

const apiRouter = Router();
const enrollmentRouter = Router({ mergeParams: true });
const meRouter = Router();
const aiCoachReportLimit = redisRateLimit({
  keyPrefix: 'ai:coach-report',
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyFn: authenticatedUserRateKey,
});

enrollmentRouter.post(
  EnrollmentPaths.Enrollment.Create,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('enrollment.create')),
  enrollmentHandlers.enroll,
);
enrollmentRouter.get(
  EnrollmentPaths.Enrollment.List,
  errorHandle(authMiddleware),
  enrollmentHandlers.listByCourse,
);
enrollmentRouter.get(
  EnrollmentPaths.Enrollment.LearnersExportCsv,
  errorHandle(authMiddleware),
  enrollmentHandlers.exportLearnersCsv,
);
enrollmentRouter.get(
  EnrollmentPaths.Enrollment.Learners,
  errorHandle(authMiddleware),
  enrollmentHandlers.listLearners,
);
enrollmentRouter.get(
  EnrollmentPaths.Enrollment.LearnerExerciseHistory,
  errorHandle(authMiddleware),
  enrollmentHandlers.exerciseHistory,
);
enrollmentRouter.post(
  EnrollmentPaths.Enrollment.LearnerAiCoach,
  errorHandle(authMiddleware),
  errorHandle(aiCoachReportLimit),
  enrollmentHandlers.aiCoach,
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
