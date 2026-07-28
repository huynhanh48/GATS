import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import * as AssignmentRepo from '@src/repos/AssignmentRepo';
import * as AssignmentSubmissionRepo from '@src/repos/AssignmentSubmissionRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as QuizAttemptRepo from '@src/repos/QuizAttemptRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as UserRepo from '@src/repos/UserRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  FORBIDDEN: 'Forbidden',
  COURSE_NOT_FOUND: 'Course not found',
  USER_NOT_FOUND: 'User not found',
} as const;

export type QuizAttemptHistoryItem = {
  kind: 'quiz';
  lessonId: string;
  lessonTitle: string | null;
  quizId: string;
  quizTitle: string | null;
  attemptId: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  wrongQuestions: Array<{
    questionId: string;
    question: string;
    score: number | null;
  }>;
};

export type AssignmentHistoryItem = {
  kind: 'assignment';
  lessonId: string;
  lessonTitle: string | null;
  assignmentId: string;
  assignmentTitle: string | null;
  submissionId: string;
  submissionNumber: number;
  status: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  passed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
};

export type CourseExerciseHistory = {
  course: { id: string; title: string };
  user: { id: number; name: string | null; email: string | null };
  summary: {
    quizAttempts: number;
    assignmentSubmissions: number;
    avgQuizPercentage: number | null;
    weakLessons: string[];
  };
  items: Array<QuizAttemptHistoryItem | AssignmentHistoryItem>;
};

async function assertCanManage(courseId: string, actorUserId: number) {
  const canManage = await CourseAccessService.canManageCourse(
    actorUserId,
    courseId,
  );
  if (!canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }
}

async function getCourseUserHistory(
  courseId: string,
  userId: number,
  actorUserId: number,
): Promise<CourseExerciseHistory> {
  await assertCanManage(courseId, actorUserId);

  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const user = await UserRepo.findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const lessons = await LessonRepo.listByCourse(courseId);
  const items: CourseExerciseHistory['items'] = [];
  const quizPercentages: number[] = [];
  const weakLessons = new Set<string>();

  for (const lesson of lessons) {
    const quiz = await QuizRepo.findByLessonId(lesson.id);
    if (quiz) {
      const attempts = await QuizAttemptRepo.listAttemptsByUser(
        quiz.id,
        userId,
      );
      for (const attempt of attempts) {
        if (
          attempt.status !== 'submitted' &&
          attempt.status !== 'graded' &&
          attempt.status !== 'expired'
        ) {
          continue;
        }

        const answers = await QuizAttemptRepo.listAnswersByAttempt(attempt.id);
        const questions = await QuizQuestionRepo.listByQuizId(quiz.id);
        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const wrongQuestions = answers
          .filter((a) => a.isCorrect === false)
          .map((a) => ({
            questionId: a.questionId,
            question: questionMap.get(a.questionId)?.question ?? a.questionId,
            score: a.score,
          }));

        if (
          attempt.percentage != null &&
          attempt.percentage < (quiz.passingScore ?? 70)
        ) {
          weakLessons.add(lesson.title ?? lesson.id);
        }
        if (attempt.percentage != null) {
          quizPercentages.push(Number(attempt.percentage));
        }

        items.push({
          kind: 'quiz',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          quizId: quiz.id,
          quizTitle: quiz.title,
          attemptId: attempt.id,
          attemptNumber: attempt.attemptNumber,
          status: attempt.status,
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          passed: attempt.passed,
          submittedAt: attempt.submittedAt?.toISOString?.() ?? null,
          wrongQuestions,
        });
      }
    }

    const assignment = await AssignmentRepo.findByLessonId(lesson.id);
    if (assignment) {
      const submissions =
        await AssignmentSubmissionRepo.listByAssignmentAndUser(
          assignment.id,
          userId,
        );
      for (const sub of submissions) {
        if (sub.status === 'draft') continue;
        const percentage =
          sub.score != null && assignment.maxScore > 0
            ? (sub.score / assignment.maxScore) * 100
            : null;
        if (
          percentage != null &&
          percentage < (assignment.passingScore ?? 70)
        ) {
          weakLessons.add(lesson.title ?? lesson.id);
        }
        items.push({
          kind: 'assignment',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          submissionId: sub.id,
          submissionNumber: sub.submissionNumber,
          status: sub.status,
          score: sub.score,
          maxScore: assignment.maxScore,
          percentage,
          passed:
            percentage == null
              ? null
              : percentage >= (assignment.passingScore ?? 70),
          feedback: sub.feedback,
          submittedAt: sub.submittedAt?.toISOString?.() ?? null,
          gradedAt: sub.gradedAt?.toISOString?.() ?? null,
        });
      }
    }
  }

  items.sort((a, b) => {
    const ta = a.kind === 'quiz' ? a.submittedAt : a.submittedAt ?? a.gradedAt;
    const tb = b.kind === 'quiz' ? b.submittedAt : b.submittedAt ?? b.gradedAt;
    return (tb ?? '').localeCompare(ta ?? '');
  });

  const avgQuizPercentage =
    quizPercentages.length > 0
      ? Math.round(
          (quizPercentages.reduce((s, n) => s + n, 0) / quizPercentages.length) *
            10,
        ) / 10
      : null;

  return {
    course: { id: course.id, title: course.title },
    user: {
      id: user.id,
      name: user.userName ?? null,
      email: user.email ?? null,
    },
    summary: {
      quizAttempts: items.filter((i) => i.kind === 'quiz').length,
      assignmentSubmissions: items.filter((i) => i.kind === 'assignment')
        .length,
      avgQuizPercentage,
      weakLessons: [...weakLessons],
    },
    items,
  };
}

export default {
  Errors,
  getCourseUserHistory,
};
