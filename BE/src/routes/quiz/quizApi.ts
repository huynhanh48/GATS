import { Router } from 'express';

import QuizPaths from '@src/common/paths/quiz';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import {
  handleQuizAiUploadError,
  quizAiUploadMiddleware,
} from '@src/middleware/quizAiUploadMiddleware';

import quizHandlers from './quizRouter';

const apiRouter = Router();

const requireCourseUpdate = (courseIdParam = 'courseId') =>
  requirePermission('update', RESOURCE_TYPES.COURSE, (req) => {
    const raw = req.params[courseIdParam];
    return typeof raw === 'string' ? raw : undefined;
  });

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
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.getAdminQuiz),
);

apiRouter.patch(
  QuizPaths.Quiz.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.updateQuiz),
);

apiRouter.post(
  QuizPaths.Quiz.Questions.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.addQuestion),
);

apiRouter.post(
  QuizPaths.Quiz.Questions.AiGenerate,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizAiUploadMiddleware,
  handleQuizAiUploadError,
  errorHandle(quizHandlers.aiGenerate),
);

apiRouter.get(
  QuizPaths.Quiz.Questions.AiGenerateJob,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.getAiGenerateJob),
);

apiRouter.get(
  QuizPaths.Quiz.Questions.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(quizHandlers.listQuestions),
);

apiRouter.patch(
  QuizPaths.Quiz.Questions.Reorder,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
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
