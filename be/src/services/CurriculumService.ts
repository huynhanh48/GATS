import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as LessonAttachmentRepo from '@src/repos/LessonAttachmentRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as PostRepo from '@src/repos/PostRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import {
  buildCurriculumSections,
  flattenOrderedLessons,
  resolveSequentialLockedLessonIds,
} from '@src/services/course-curriculum-builder';

async function getCurriculum(courseId: string, userId: number | null) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);

  const canManage =
    userId !== null &&
    (await CourseAccessService.canManageCourse(userId, courseId));
  const isEnrolled =
    userId !== null && (await CourseAccessService.isEnrolled(userId, courseId));
  const hasFullAccess = userId !== null && (canManage || isEnrolled);

  const [sections, lessons] = await Promise.all([
    CourseSectionRepo.listByCourse(courseId),
    LessonRepo.listByCourse(courseId),
  ]);

  // Chặn khoá học: học viên đã ghi danh phải hoàn thành bài trước mới mở bài sau.
  // Giảng viên/quản trị (canManage) không bị chặn để còn kiểm tra nội dung.
  let sequentiallyLockedLessonIds: Set<string> | undefined;
  if (userId !== null && isEnrolled && !canManage) {
    const progressRows = await LessonProgressRepo.listByUserAndCourse(
      userId,
      courseId,
    );
    const completedLessonIds = new Set(
      progressRows
        .filter((row) => row.isCompleted)
        .map((row) => row.lessonId),
    );
    sequentiallyLockedLessonIds = resolveSequentialLockedLessonIds(
      flattenOrderedLessons(sections, lessons),
      completedLessonIds,
    );
  }

  const readableLessonIds = lessons
    .filter((lesson) => hasFullAccess || lesson.isPreview)
    .filter(
      (lesson) => !sequentiallyLockedLessonIds?.has(lesson.id),
    )
    .map((lesson) => lesson.id);
  const attachmentsByLesson =
    await LessonAttachmentRepo.listByLessonIds(readableLessonIds);

  const linkedPostIds = lessons
    .map((lesson) => lesson.linkedPostId)
    .filter((id): id is string => Boolean(id));
  const linkedPostsById =
    await PostRepo.findPublishedSummariesByIds(linkedPostIds);

  return {
    data: buildCurriculumSections(
      sections,
      lessons,
      hasFullAccess,
      attachmentsByLesson,
      linkedPostsById,
      sequentiallyLockedLessonIds,
    ),
  };
}

export default {
  getCurriculum,
};
