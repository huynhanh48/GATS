import { selectCourseReviewMilestones } from '@src/common/utils/course-review-milestones';
import type { CourseReviewCheckpointInput } from '@src/models/CourseReviewMilestone.model';
import * as CourseReviewMilestoneRepo from '@src/repos/CourseReviewMilestoneRepo';
import * as CourseReviewRepo from '@src/repos/CourseReviewRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import CourseAccessService from '@src/services/CourseAccessService';

function messageFor(milestone: number): string {
  if (milestone === 25) return 'Bạn thấy cảm nhận ban đầu về khóa học thế nào?';
  if (milestone === 50)
    return 'Bạn đã đi được nửa chặng đường! Hãy chia sẻ trải nghiệm nhé.';
  if (milestone === 75)
    return 'Sắp hoàn thành rồi! Đánh giá của bạn giúp ích rất nhiều cho cộng đồng.';
  return 'Chúc mừng bạn đã hoàn thành khóa học! Hãy để lại đánh giá tổng kết nhé.';
}

async function checkpoint(
  userId: number,
  courseId: string,
  input: CourseReviewCheckpointInput,
) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);
  const enrolled = await CourseAccessService.isEnrolled(userId, courseId);
  if (!enrolled) return { data: { prompt: null } };

  const totalLessons = await LessonRepo.countByCourse(courseId);
  const [progress, existingReview, recorded] = await Promise.all([
    LessonProgressRepo.getCourseAggregate(userId, courseId, totalLessons),
    CourseReviewRepo.findByCourseAndUser(courseId, userId),
    CourseReviewMilestoneRepo.listByUserAndCourse(userId, courseId),
  ]);
  if (totalLessons === 0) return { data: { progress, prompt: null } };

  const decision = selectCourseReviewMilestones({
    progressPercent: progress.percent,
    totalLessons,
    recordedMilestones: recorded.map((row) => row.milestone),
    hasReview: existingReview != null,
  });
  const selected = decision.selected;
  if (selected == null) {
    return { data: { progress, review: existingReview ?? null, prompt: null } };
  }

  for (const milestone of [...decision.skipped, selected]) {
    const row = await CourseReviewMilestoneRepo.record({
      userId,
      courseId,
      milestone,
      progressPercent: progress.percent,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      status: milestone === selected ? 'prompted' : 'skipped',
      source: input.source,
      deviceId: input.deviceId,
      metadata: {
        ...input.metadata,
        ...(input.lessonId ? { lessonId: input.lessonId } : {}),
      },
    });
    if (milestone === selected && !row) {
      return {
        data: { progress, review: existingReview ?? null, prompt: null },
      };
    }
  }

  return {
    data: {
      progress,
      review: existingReview ?? null,
      prompt: {
        milestone: selected,
        message: messageFor(selected),
        mode: existingReview ? 'update' : 'create',
      },
    },
  };
}

export default { checkpoint };
