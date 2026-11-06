import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  GradeEssayAnswerInput,
  SaveQuizAnswerInput,
} from '@src/models/Quiz.model';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as QuizAttemptRepo from '@src/repos/QuizAttemptRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as UserRepo from '@src/repos/UserRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import * as LessonProgressSyncService from '@src/services/LessonProgressSyncService';
import * as QuizGradingService from '@src/services/QuizGradingService';

const Errors = {
  QUIZ_NOT_FOUND: 'Quiz not found',
  ATTEMPT_NOT_FOUND: 'Attempt not found',
  ATTEMPT_NOT_IN_PROGRESS: 'Attempt is not in progress',
  ATTEMPT_EXPIRED: 'Attempt has expired',
  MAX_ATTEMPTS_REACHED: 'Maximum attempts reached',
  ANSWER_NOT_FOUND: 'Answer not found',
  FORBIDDEN: 'You do not have access to this attempt',
} as const;

async function assertAttemptOwner(attemptId: string, userId: number) {
  const attempt = await QuizAttemptRepo.findAttemptById(attemptId);
  if (!attempt) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ATTEMPT_NOT_FOUND);
  }
  if (attempt.userId !== userId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }
  return attempt;
}

async function startAttempt(quizId: string, userId: number) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const lesson = await CourseAccessService.assertLessonAccess(
    userId,
    quiz.lessonId,
  );

  const now = new Date();
  if (quiz.availableFrom && now < quiz.availableFrom) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Quiz is not available yet',
    );
  }
  if (quiz.availableUntil && now > quiz.availableUntil) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Quiz is no longer available',
    );
  }

  const inProgress = await QuizAttemptRepo.findInProgressAttempt(
    quizId,
    userId,
  );
  if (inProgress) {
    return {
      data: {
        attemptId: inProgress.id,
        attemptNumber: inProgress.attemptNumber,
        startedAt: inProgress.startedAt,
        expiresAt: inProgress.expiresAt,
      },
    };
  }

  const attemptCount = await QuizRepo.countAttemptsByUser(quizId, userId);
  if (attemptCount >= quiz.maxAttempts) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.MAX_ATTEMPTS_REACHED,
    );
  }

  const attemptNumber =
    (await QuizRepo.getMaxAttemptNumber(quizId, userId)) + 1;
  const expiresAt = quiz.timeLimit
    ? new Date(now.getTime() + quiz.timeLimit * 60 * 1000)
    : null;

  const attempt = await QuizAttemptRepo.createAttempt({
    quizId,
    userId,
    attemptNumber,
    expiresAt,
  });

  return {
    data: {
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
    },
  };
}

async function saveAnswer(
  attemptId: string,
  questionId: string,
  userId: number,
  input: SaveQuizAnswerInput,
) {
  const attempt = await assertAttemptOwner(attemptId, userId);
  if (attempt.status !== 'in_progress') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.ATTEMPT_NOT_IN_PROGRESS,
    );
  }
  if (attempt.expiresAt && new Date() > attempt.expiresAt) {
    await QuizAttemptRepo.updateAttempt(attemptId, { status: 'expired' });
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.ATTEMPT_EXPIRED,
    );
  }

  const answer = await QuizAttemptRepo.upsertAnswer({
    attemptId,
    questionId,
    textAnswer: input.text_answer ?? null,
    selectedOptionIds: input.selected_option_ids,
  });

  return { data: answer };
}

async function submitAttempt(attemptId: string, userId: number) {
  const attempt = await assertAttemptOwner(attemptId, userId);
  if (attempt.status !== 'in_progress') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.ATTEMPT_NOT_IN_PROGRESS,
    );
  }
  if (attempt.expiresAt && new Date() > attempt.expiresAt) {
    await QuizAttemptRepo.updateAttempt(attemptId, { status: 'expired' });
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.ATTEMPT_EXPIRED,
    );
  }

  const quiz = await QuizRepo.findById(attempt.quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const lesson = await CourseAccessService.assertLessonAccess(
    userId,
    quiz.lessonId,
  );

  const questions = await QuizQuestionRepo.listByQuizId(quiz.id);
  const questionIds = questions.map((q) => q.id);
  // `listOptionsByQuestionIds` trả về toàn bộ đáp án của câu hỏi
  // (cả lựa chọn lẫn đáp án được chấp nhận), dùng chung cho mọi loại câu hỏi.
  const options = await QuizQuestionRepo.listOptionsByQuestionIds(questionIds);
  const answers = await QuizAttemptRepo.listAnswersByAttempt(attemptId);
  const answerIds = answers.map((a) => a.id);
  const answerOptions =
    await QuizAttemptRepo.listAnswerOptionsByAnswerIds(answerIds);

  const scoreRows: Array<{ score: number; maxPoints: number }> = [];

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const qOptions = options.filter((o) => o.questionId === question.id);

    if (!answer) {
      scoreRows.push({ score: 0, maxPoints: question.points });
      continue;
    }

    const selectedOptionIds = answerOptions
      .filter((ao) => ao.answerId === answer.id)
      .map((ao) => ao.optionId);

    const result = QuizGradingService.gradeQuizQuestion({
      question,
      answers: qOptions,
      selectedAnswerIds: selectedOptionIds,
      textAnswer: answer.textAnswer,
    });

    await QuizAttemptRepo.updateAnswerAutoGrade(answer.id, {
      score: result.score,
      isCorrect: result.isCorrect,
    });

    scoreRows.push({
      score: result.score,
      maxPoints: question.points,
    });
  }

  const totals = QuizGradingService.computeAttemptTotals(
    scoreRows,
    quiz.passingScore,
  );

  const status = 'graded';
  const now = new Date();

  const updated = await QuizAttemptRepo.updateAttempt(attemptId, {
    status,
    score: totals.score,
    maxScore: totals.maxScore,
    percentage: totals.percentage,
    passed: totals.passed,
    submittedAt: now,
    gradedAt: now,
  });

  const attemptCount = await QuizRepo.countAttemptsByUser(quiz.id, userId);

  await LessonProgressSyncService.syncQuizResult({
    userId,
    courseId: lesson.courseId,
    lessonId: lesson.id,
    score: totals.score,
    maxScore: totals.maxScore,
    percentage: totals.percentage,
    passed: totals.passed,
    attemptCount,
  });

  return {
    data: {
      attemptId: updated?.id,
      status: updated?.status,
      score: updated?.score,
      maxScore: updated?.maxScore,
      percentage: updated?.percentage,
      passed: updated?.passed,
    },
  };
}

async function gradeEssayAnswer(
  answerId: string,
  graderId: number,
  input: GradeEssayAnswerInput,
) {
  const answer = await QuizAttemptRepo.findAnswerById(answerId);
  if (!answer) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ANSWER_NOT_FOUND);
  }

  const attempt = await QuizAttemptRepo.findAttemptById(answer.attemptId);
  if (!attempt) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ATTEMPT_NOT_FOUND);
  }

  const quiz = await QuizRepo.findById(attempt.quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  await QuizAttemptRepo.updateAnswerGrade(answerId, {
    score: input.score,
    isCorrect: input.is_correct ?? null,
    feedback: input.feedback ?? null,
    gradedById: graderId,
  });

  const questions = await QuizQuestionRepo.listByQuizId(quiz.id);
  const refreshedAnswers = await QuizAttemptRepo.listAnswersByAttempt(
    attempt.id,
  );

  const scoreRows: Array<{ score: number; maxPoints: number }> = [];

  for (const question of questions) {
    const qAnswer = refreshedAnswers.find((a) => a.questionId === question.id);
    scoreRows.push({
      score: qAnswer?.score ?? 0,
      maxPoints: question.points,
    });
  }

  const totals = QuizGradingService.computeAttemptTotals(
    scoreRows,
    quiz.passingScore,
  );
  const now = new Date();
  await QuizAttemptRepo.updateAttempt(attempt.id, {
    status: 'graded',
    score: totals.score,
    maxScore: totals.maxScore,
    percentage: totals.percentage,
    passed: totals.passed,
    gradedAt: now,
  });

  const lesson = await CourseAccessService.assertLessonAccess(
    attempt.userId,
    quiz.lessonId,
  );
  const attemptCount = await QuizRepo.countAttemptsByUser(
    quiz.id,
    attempt.userId,
  );
  await LessonProgressSyncService.syncQuizResult({
    userId: attempt.userId,
    courseId: lesson.courseId,
    lessonId: lesson.id,
    score: totals.score,
    maxScore: totals.maxScore,
    percentage: totals.percentage,
    passed: totals.passed,
    attemptCount,
  });

  return { message: 'Answer graded' };
}

async function assertQuizManageAccess(quizId: string, actorUserId: number) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const lesson = await LessonRepo.findById(quiz.lessonId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const canManage = await CourseAccessService.canManageCourse(
    actorUserId,
    lesson.courseId,
  );
  if (!canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  return { quiz, lesson };
}

async function listAttemptsForQuiz(quizId: string, actorUserId: number) {
  await assertQuizManageAccess(quizId, actorUserId);

  const attempts = await QuizAttemptRepo.listByQuiz(quizId);
  const userIds = [...new Set(attempts.map((a) => a.userId))];
  const users = await UserRepo.findByIds(userIds);
  const userById = new Map(users.map((u) => [u.id, u]));

  return {
    data: attempts.map((attempt) => ({
      id: attempt.id,
      userId: attempt.userId,
      userName: userById.get(attempt.userId)?.userName ?? null,
      email: userById.get(attempt.userId)?.email ?? null,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      gradedAt: attempt.gradedAt,
      expiresAt: attempt.expiresAt,
    })),
  };
}

async function resetAttemptsForUser(
  quizId: string,
  targetUserId: number,
  actorUserId: number,
) {
  const { lesson } = await assertQuizManageAccess(quizId, actorUserId);

  const deletedCount = await QuizAttemptRepo.deleteAttemptsForUserByQuiz(
    quizId,
    targetUserId,
  );
  await LessonProgressRepo.deleteByUserAndLesson(targetUserId, lesson.id);

  await AuditLogRepo.record({
    actorUserId,
    action: 'quiz.reset_attempts',
    resourceType: 'quiz',
    resourceId: quizId,
    meta: { targetUserId, deletedCount },
  });

  return { message: 'Đã reset lượt làm bài của học viên', deletedCount };
}

async function getAttemptResult(attemptId: string, userId: number) {
  const attempt = await assertAttemptOwner(attemptId, userId);
  const quiz = await QuizRepo.findById(attempt.quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  if (!quiz.showResult && attempt.status !== 'graded') {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Results are not available',
    );
  }

  const questions = await QuizQuestionRepo.listByQuizId(quiz.id);
  const questionIds = questions.map((q) => q.id);
  const options = quiz.showCorrectAnswer
    ? await QuizQuestionRepo.listOptionsByQuestionIds(questionIds)
    : [];
  const answers = await QuizAttemptRepo.listAnswersByAttempt(attemptId);

  return {
    data: {
      attemptId: attempt.id,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      passed: attempt.passed,
      showCorrectAnswer: quiz.showCorrectAnswer,
      showExplanation: quiz.showExplanation,
      answers: answers.map((answer) => {
        const question = questions.find((q) => q.id === answer.questionId);
        return {
          questionId: answer.questionId,
          score: answer.score,
          isCorrect: answer.isCorrect,
          feedback: answer.feedback,
          explanation:
            quiz.showExplanation && question ? question.explanation : undefined,
          correctOptions: quiz.showCorrectAnswer
            ? options
                .filter(
                  (o) => o.questionId === answer.questionId && o.isCorrect,
                )
                .map((o) => o.id)
            : undefined,
        };
      }),
    },
  };
}

export default {
  Errors,
  startAttempt,
  saveAnswer,
  submitAttempt,
  gradeEssayAnswer,
  getAttemptResult,
  listAttemptsForQuiz,
  resetAttemptsForUser,
};
