import { Router } from 'express';
import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import QuizPaths from '@src/common/paths/quiz';
import { RouteError } from '@src/common/utils/route-errors';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import {
  authenticatedUserRateKey,
  redisRateLimit,
} from '@src/middleware/redisRateLimit';
import {
  handleQuizAiUploadError,
  quizAiUploadMiddleware,
} from '@src/middleware/quizAiUploadMiddleware';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import CourseAccessService from '@src/services/CourseAccessService';

import quizHandlers from './quizRouter';

const apiRouter = Router();
const aiGenerationLimit = redisRateLimit({
  keyPrefix: 'ai:generation',
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyFn: authenticatedUserRateKey,
});

const requireCourseUpdate = (courseIdParam = 'courseId') =>
  requirePermission('update', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam];
    return typeof raw === 'string' ? raw : undefined;
  });

/**
 * Quiz routes only contain `quizId`, while course permissions are scoped by
 * `courseId`. Resolve the owning lesson/course before authorizing so course
 * instructors are not incorrectly rejected for lacking a global update role.
 */
async function requireQuizCourseUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const quizId = req.params.quizId;
  if (typeof quizId !== 'string') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid quizId');
  }
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Quiz not found');
  }
  const lesson = await LessonRepo.findById(quiz.lessonId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Lesson not found');
  }
  const allowed = await CourseAccessService.canManageCourse(
    req.authUser.id,
    lesson.courseId,
  );
  if (!allowed) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
  }
  return next();
}

apiRouter.post(
  QuizPaths.LessonQuiz.Create,
  errorHandle(authMiddleware),
  errorHandle(requireCourseUpdate()),
  errorHandle(quizHandlers.createQuiz),
);

apiRouter.get(
  QuizPaths.LessonQuiz.Get,
  errorHandle(authMiddleware),
  errorHandle(quizHandlers.getMemberQuiz),
);

apiRouter.get(
  QuizPaths.Quiz.Get,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.getAdminQuiz),
);

apiRouter.patch(
  QuizPaths.Quiz.Update,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.updateQuiz),
);

apiRouter.post(
  QuizPaths.Quiz.Questions.Create,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.addQuestion),
);

apiRouter.post(
  QuizPaths.Quiz.Questions.AiGenerate,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(aiGenerationLimit),
  quizAiUploadMiddleware,
  handleQuizAiUploadError,
  errorHandle(quizHandlers.aiGenerate),
);

apiRouter.get(
  QuizPaths.Quiz.Questions.AiGenerateJob,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.getAiGenerateJob),
);

apiRouter.get(
  QuizPaths.Quiz.Questions.List,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.listQuestions),
);

apiRouter.patch(
  QuizPaths.Quiz.Questions.Reorder,
  errorHandle(authMiddleware),
  errorHandle(requireQuizCourseUpdate),
  errorHandle(quizHandlers.reorderQuestions),
);

apiRouter.get(
  QuizPaths.Question.Get,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.getQuestion),
);

apiRouter.put(
  QuizPaths.Question.PutUpdate,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.updateQuestion),
);

apiRouter.patch(
  QuizPaths.Question.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.updateQuestion),
);

apiRouter.delete(
  QuizPaths.Question.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.removeQuestion),
);

apiRouter.get(
  QuizPaths.Quiz.Take,
  errorHandle(authMiddleware),
  errorHandle(quizHandlers.takeQuiz),
);

apiRouter.post(
  QuizPaths.Quiz.Submit,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('quiz.submit')),
  errorHandle(quizHandlers.submitQuiz),
);

apiRouter.patch(
  QuizPaths.Answer.Grade,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.gradeEssayAnswer),
);

apiRouter.post(
  QuizPaths.Quiz.Attempts.Create,
  errorHandle(authMiddleware),
  errorHandle(quizHandlers.startAttempt),
);

apiRouter.get(
  QuizPaths.Quiz.Attempts.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.listAttempts),
);

apiRouter.post(
  QuizPaths.Quiz.Attempts.Reset,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.resetAttempts),
);

apiRouter.put(
  QuizPaths.Attempt.SaveAnswer,
  errorHandle(authMiddleware),
  errorHandle(quizHandlers.saveAnswer),
);

apiRouter.post(
  QuizPaths.Attempt.Submit,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('quiz.attempt.submit')),
  errorHandle(quizHandlers.submitAttempt),
);

apiRouter.get(
  QuizPaths.Attempt.Result,
  errorHandle(authMiddleware),
  errorHandle(quizHandlers.getAttemptResult),
);

export default apiRouter;
