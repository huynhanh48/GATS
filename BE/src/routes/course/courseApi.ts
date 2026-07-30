import { NextFunction, Request, Response, Router } from 'express';

import CoursePaths from '@src/common/paths/course';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  fileUploadMiddleware,
  handleMediaUploadError,
} from '@src/middleware/mediaUploadMiddleware';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import requireStaff from '@src/middleware/requireStaff';

import courseHandlers from './courseRouter';
import flashcardAdminHandlers from '../flashcard/flashcardAdminRouter';

const apiRouter = Router();
const courseRouter = Router();
const courseManagementRouter = Router();

const requireCourseUpdate = (courseIdParam = 'courseId') =>
  requirePermission('update', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam] ?? req.params.id;
    return typeof raw === 'string' ? raw : undefined;
  });

const requireCourseRead = (courseIdParam = 'courseId') =>
  requirePermission('read', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam] ?? req.params.id;
    return typeof raw === 'string' ? raw : undefined;
  });

const requireCourseCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.authUser?.roles.includes('instructor')) {
    return next();
  }
  return requirePermission('create', RESOURCE_TYPES.COURSE)(req, res, next);
};

courseRouter.get(
  CoursePaths.Course.List,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.list,
);
courseRouter.post(
  CoursePaths.Course.Recommendations,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.recommendations,
);
courseRouter.post(
  CoursePaths.Course.RecommendationEvents,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.recommendationEvent,
);
courseRouter.get(
  CoursePaths.Course.Categories.List,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.listCategories,
);
courseRouter.post(
  CoursePaths.Course.Categories.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  courseHandlers.createCategory,
);
courseRouter.patch(
  CoursePaths.Course.Categories.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  courseHandlers.updateCategory,
);
courseRouter.delete(
  CoursePaths.Course.Categories.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  courseHandlers.removeCategory,
);
courseRouter.get(
  CoursePaths.Course.GetBySlug,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.getBySlug,
);

courseRouter.get(
  CoursePaths.Course.Curriculum,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.getCurriculum,
);

courseRouter.get(
  CoursePaths.Course.Sections.List,
  errorHandle(authMiddleware),
  errorHandle(requireCourseRead()),
  courseHandlers.listSections,
);
courseRouter.post(
  CoursePaths.Course.Sections.Create,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.createSection,
);
courseRouter.patch(
  CoursePaths.Course.Sections.Update,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.updateSection,
);
courseRouter.delete(
  CoursePaths.Course.Sections.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.removeSection,
);
courseRouter.post(
  CoursePaths.Course.Sections.Lessons,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.createLesson,
);
courseRouter.patch(
  CoursePaths.Course.Lessons.Update,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.updateLesson,
);
courseRouter.delete(
  CoursePaths.Course.Lessons.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.removeLesson,
);

courseRouter.get(
  CoursePaths.Course.Lessons.Attachments,
  errorHandle(authMiddleware),
  errorHandle(requireCourseRead()),
  courseHandlers.listLessonAttachments,
);
courseRouter.post(
  CoursePaths.Course.Lessons.Attachments,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.attachLessonMedia,
);
courseRouter.post(
  CoursePaths.Course.Lessons.AttachmentUpload,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  (req, res, next) => {
    fileUploadMiddleware(req, res, (err) => {
      if (err) {
        handleMediaUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  courseHandlers.uploadLessonAttachment,
);
courseRouter.delete(
  CoursePaths.Course.Lessons.AttachmentDelete,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  courseHandlers.removeLessonAttachment,
);

courseRouter.get(
  CoursePaths.Course.Get,
  errorHandle(optionalAuthMiddleware),
  courseHandlers.getById,
);

courseRouter.post(
  CoursePaths.Course.Create,
  errorHandle(authMiddleware),
  errorHandle(requireCourseCreate),
  courseHandlers.create,
);
courseRouter.patch(
  CoursePaths.Course.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  courseHandlers.update,
);
courseRouter.post(
  CoursePaths.Course.Publish,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  courseHandlers.publish,
);
courseRouter.get(
  CoursePaths.Course.PublishReadiness,
  errorHandle(authMiddleware),
  errorHandle(requireCourseRead()),
  courseHandlers.getPublishReadiness,
);
courseRouter.post(
  CoursePaths.Course.Restore,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('delete', RESOURCE_TYPES.COURSE)),
  courseHandlers.restore,
);
courseRouter.delete(
  CoursePaths.Course.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('delete', RESOURCE_TYPES.COURSE)),
  courseHandlers.remove,
);

courseManagementRouter.use(errorHandle(authMiddleware));
courseManagementRouter.use(errorHandle(requireStaff));
courseManagementRouter.get(
  CoursePaths.Management.List,
  courseHandlers.listManaged,
);
courseManagementRouter.get(
  CoursePaths.Management.Get,
  courseHandlers.getManagedById,
);
courseManagementRouter.get(
  CoursePaths.Management.AiQuizSources,
  errorHandle(requireCourseUpdate('courseId')),
  courseHandlers.listAiQuizSources,
);
courseManagementRouter.get(
  CoursePaths.Management.FlashcardDecks,
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.listDecks),
);
courseManagementRouter.post(
  CoursePaths.Management.FlashcardDecks,
  errorHandle(requireCourseUpdate('courseId')),
  errorHandle(flashcardAdminHandlers.createDeck),
);

apiRouter.use(CoursePaths.Course._, courseRouter);
apiRouter.use(CoursePaths.Management._, courseManagementRouter);
export default apiRouter;
