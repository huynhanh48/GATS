import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import CertificateService from '@src/services/CertificateService';

/** Fire-and-forget: issues a certificate once course progress reaches 100%. */
async function maybeIssueCertificate(userId: number, courseId: string) {
  try {
    const totalLessons = await LessonRepo.countByCourse(courseId);
    if (totalLessons === 0) return;
    const aggregate = await LessonProgressRepo.getCourseAggregate(
      userId,
      courseId,
      totalLessons,
    );
    if (aggregate.percent >= 100) {
      await CertificateService.issueIfEligible(userId, courseId);
    }
  } catch (err) {
    console.error('Auto certificate issuance failed', err);
  }
}

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

  if (isPassed) {
    void maybeIssueCertificate(data.userId, data.courseId);
  }
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

  if (data.passed) {
    void maybeIssueCertificate(data.userId, data.courseId);
  }
}

export default {
  syncQuizResult,
  syncAssignmentResult,
};
