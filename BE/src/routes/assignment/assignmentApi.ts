import { Router } from 'express';

import AssignmentPaths from '@src/common/paths/assignment';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requirePermission from '@src/middleware/requirePermission';

import assignmentHandlers from './assignmentRouter';

const apiRouter = Router();

const requireCourseUpdate = (courseIdParam = 'courseId') =>
  requirePermission('update', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam];
    return typeof raw === 'string' ? raw : undefined;
  });

apiRouter.post(
  AssignmentPaths.LessonAssignment.Create,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  assignmentHandlers.createAssignment,
);

apiRouter.get(
  AssignmentPaths.LessonAssignment.Get,
  errorHandle(authMiddleware),
  assignmentHandlers.getMemberAssignment,
);

apiRouter.patch(
  AssignmentPaths.Assignment.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  assignmentHandlers.updateAssignment,
);

apiRouter.delete(
  AssignmentPaths.Assignment.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  assignmentHandlers.removeAssignment,
);

apiRouter.get(
  AssignmentPaths.Assignment.Submissions.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  assignmentHandlers.listSubmissions,
);

apiRouter.patch(
  AssignmentPaths.Submission.Grade,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  assignmentHandlers.gradeSubmission,
);

apiRouter.post(
  AssignmentPaths.Assignment.Submissions.Submit,
  errorHandle(authMiddleware),
  assignmentHandlers.submitAssignment,
);

apiRouter.get(
  AssignmentPaths.Assignment.Submissions.Mine,
  errorHandle(authMiddleware),
  assignmentHandlers.getMySubmission,
);

apiRouter.post(
  AssignmentPaths.Assignment.Submissions.InitUpload,
  errorHandle(authMiddleware),
  assignmentHandlers.initUpload,
);

apiRouter.post(
  AssignmentPaths.Submission.CompleteUpload,
  errorHandle(authMiddleware),
  assignmentHandlers.completeUpload,
);

export default apiRouter;
