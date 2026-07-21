import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as LessonAttachmentRepo from '@src/repos/LessonAttachmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as PostRepo from '@src/repos/PostRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import { buildCurriculumSections } from '@src/services/course-curriculum-builder';

async function getCurriculum(courseId: string, userId: number | null) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);

  const hasFullAccess =
    userId !== null &&
    ((await CourseAccessService.canManageCourse(userId, courseId)) ||
      (await CourseAccessService.isEnrolled(userId, courseId)));

  const [sections, lessons] = await Promise.all([
    CourseSectionRepo.listByCourse(courseId),
    LessonRepo.listByCourse(courseId),
  ]);

  const unlockedLessonIds = lessons
    .filter((lesson) => hasFullAccess || lesson.isPreview)
    .map((lesson) => lesson.id);
  const attachmentsByLesson =
    await LessonAttachmentRepo.listByLessonIds(unlockedLessonIds);

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
    ),
  };
}

export default {
  getCurriculum,
};
