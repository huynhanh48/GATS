import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';

export async function syncQuizResult(data: {
  userId: number;
  courseId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptCount: number;
}): Promise<void> {
  const existing = await LessonProgressRepo.findByUserAndLesson(
    data.userId,
    data.lessonId,
  );

  const bestScore =
    existing?.bestScore != null
      ? Math.max(existing.bestScore, data.score)
      : data.score;
  const bestPercentage =
    existing?.bestPercentage != null
      ? Math.max(existing.bestPercentage, data.percentage)
      : data.percentage;
  const isPassed = (existing?.isPassed ?? false) || data.passed;

  await LessonProgressRepo.upsertQuizSummary({
    userId: data.userId,
    courseId: data.courseId,
    lessonId: data.lessonId,
    bestScore,
    bestPercentage,
    isPassed,
    attemptCount: data.attemptCount,
    isCompleted: isPassed,
    completedAt: isPassed ? new Date() : null,
  });
}

export async function syncAssignmentResult(data: {
  userId: number;
  courseId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}): Promise<void> {
  await LessonProgressRepo.upsertQuizSummary({
    userId: data.userId,
    courseId: data.courseId,
    lessonId: data.lessonId,
    bestScore: data.score,
    bestPercentage: data.percentage,
    isPassed: data.passed,
    attemptCount: 1,
    isCompleted: data.passed,
    completedAt: data.passed ? new Date() : null,
  });
}

export default {
  syncQuizResult,
  syncAssignmentResult,
};
