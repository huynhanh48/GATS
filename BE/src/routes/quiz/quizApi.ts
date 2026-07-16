import { Router } from 'express';

import QuizPaths from '@src/common/paths/quiz';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requirePermission from '@src/middleware/requirePermission';

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
  quizHandlers.createQuiz,
);

apiRouter.get(
  QuizPaths.LessonQuiz.Get,
  errorHandle(authMiddleware),
  quizHandlers.getMemberQuiz,
);

apiRouter.get(
  QuizPaths.Quiz.Get,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.getAdminQuiz,
);

apiRouter.patch(
  QuizPaths.Quiz.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.updateQuiz,
);

apiRouter.post(
  QuizPaths.Quiz.Questions.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.addQuestion,
);

apiRouter.get(
  QuizPaths.Quiz.Questions.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.listQuestions,
);

apiRouter.patch(
  QuizPaths.Quiz.Questions.Reorder,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.reorderQuestions,
);

apiRouter.get(
  QuizPaths.Question.Get,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.getQuestion,
);

apiRouter.put(
  QuizPaths.Question.PutUpdate,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.updateQuestion,
);

apiRouter.patch(
  QuizPaths.Question.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.updateQuestion,
);

apiRouter.delete(
  QuizPaths.Question.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.removeQuestion,
);

apiRouter.get(
  QuizPaths.Quiz.Take,
  errorHandle(authMiddleware),
  quizHandlers.takeQuiz,
);

apiRouter.post(
  QuizPaths.Quiz.Submit,
  errorHandle(authMiddleware),
  quizHandlers.submitQuiz,
);

apiRouter.patch(
  QuizPaths.Answer.Grade,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  quizHandlers.gradeEssayAnswer,
);

apiRouter.post(
  QuizPaths.Quiz.Attempts.Create,
  errorHandle(authMiddleware),
  quizHandlers.startAttempt,
);

apiRouter.put(
  QuizPaths.Attempt.SaveAnswer,
  errorHandle(authMiddleware),
  quizHandlers.saveAnswer,
);

apiRouter.post(
  QuizPaths.Attempt.Submit,
  errorHandle(authMiddleware),
  quizHandlers.submitAttempt,
);

apiRouter.get(
  QuizPaths.Attempt.Result,
  errorHandle(authMiddleware),
  quizHandlers.getAttemptResult,
);

export default apiRouter;
