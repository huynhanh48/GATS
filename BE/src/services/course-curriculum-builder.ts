import type {
  CourseDetailLesson,
  CourseDetailSection,
} from '@src/models/Course.model';
import type { CourseSectionRecord } from '@src/models/CourseSection.model';
import type { LessonRecord } from '@src/models/Lesson.model';
import type { LessonAttachmentPublic } from '@src/models/LessonAttachment.model';

export type AttachmentsByLesson = Map<string, LessonAttachmentPublic[]>;

export type LinkedPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
};

export type LinkedPostsById = Map<string, LinkedPostSummary>;

export function isLessonUnlocked(
  lesson: Pick<LessonRecord, 'isPreview'> & { isArticlePreview?: boolean },
  hasFullAccess: boolean,
): boolean {
  return hasFullAccess || lesson.isPreview || Boolean(lesson.isArticlePreview);
}

export function groupLessonsBySectionId(
  lessons: LessonRecord[],
): Map<string, LessonRecord[]> {
  const grouped = new Map<string, LessonRecord[]>();
  for (const lesson of lessons) {
    const existing = grouped.get(lesson.sectionId) ?? [];
    existing.push(lesson);
    grouped.set(lesson.sectionId, existing);
  }
  return grouped;
}

function resolveLinkedPost(
  lesson: LessonRecord,
  linkedPostsById?: LinkedPostsById,
): LinkedPostSummary | null {
  if (!lesson.linkedPostId || !linkedPostsById) return null;
  return linkedPostsById.get(lesson.linkedPostId) ?? null;
}

export function mapDetailLesson(
  lesson: LessonRecord,
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
  linkedPostsById?: LinkedPostsById,
): CourseDetailLesson {
  const unlocked = isLessonUnlocked(lesson, hasFullAccess);
  const articleUnlocked = hasFullAccess || lesson.isArticlePreview;
  const attachments = attachmentsByLesson?.get(lesson.id) ?? [];
  const linkedPost = resolveLinkedPost(lesson, linkedPostsById);
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    order: lesson.order,
    isPreview: lesson.isPreview,
    isArticlePreview: lesson.isArticlePreview,
    videoPreviewDurationSeconds: lesson.videoPreviewDurationSeconds,
    duration: lesson.duration,
    linkedPostId: lesson.linkedPostId ?? null,
    linkedPost: articleUnlocked ? linkedPost : null,
    ...(articleUnlocked ? { content: lesson.content } : {}),
    ...(articleUnlocked ? { attachments } : {}),
    locked: !unlocked,
  };
}

export function mapCurriculumLesson(
  lesson: LessonRecord,
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
  linkedPostsById?: LinkedPostsById,
): {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  isPreview: boolean;
  isArticlePreview?: boolean;
  videoPreviewDurationSeconds?: number;
  duration: number | null;
  content?: string | null;
  attachments?: LessonAttachmentPublic[];
  locked: boolean;
  linkedPostId: string | null;
  linkedPost: LinkedPostSummary | null;
} {
  const unlocked = isLessonUnlocked(lesson, hasFullAccess);
  const articleUnlocked = hasFullAccess || lesson.isArticlePreview;
  const attachments = attachmentsByLesson?.get(lesson.id) ?? [];
  const linkedPost = resolveLinkedPost(lesson, linkedPostsById);
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    order: lesson.order,
    isPreview: lesson.isPreview,
    isArticlePreview: lesson.isArticlePreview,
    videoPreviewDurationSeconds: lesson.videoPreviewDurationSeconds,
    duration: lesson.duration,
    linkedPostId: lesson.linkedPostId ?? null,
    linkedPost: articleUnlocked ? linkedPost : null,
    ...(articleUnlocked ? { content: lesson.content } : {}),
    ...(articleUnlocked ? { attachments } : {}),
    locked: !unlocked,
  };
}

export function buildDetailSections(
  sections: CourseSectionRecord[],
  lessons: LessonRecord[],
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
  linkedPostsById?: LinkedPostsById,
): CourseDetailSection[] {
  const lessonsBySectionId = groupLessonsBySectionId(lessons);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return sortedSections.map((section) => {
    const sectionLessons = (lessonsBySectionId.get(section.id) ?? []).sort(
      (a, b) => a.order - b.order,
    );
    const mappedLessons = sectionLessons.map((lesson) =>
      mapDetailLesson(
        lesson,
        hasFullAccess,
        attachmentsByLesson,
        linkedPostsById,
      ),
    );

    return {
      id: section.id,
      title: section.title,
      order: section.order,
      lessonCount: mappedLessons.length,
      totalDurationSeconds: mappedLessons.reduce(
        (sum, lesson) => sum + (lesson.duration ?? 0),
        0,
      ),
      lessons: mappedLessons,
    };
  });
}

export function buildCurriculumSections(
  sections: CourseSectionRecord[],
  lessons: LessonRecord[],
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
  linkedPostsById?: LinkedPostsById,
) {
  const lessonsBySectionId = groupLessonsBySectionId(lessons);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return sortedSections.map((section) => {
    const sectionLessons = (lessonsBySectionId.get(section.id) ?? []).sort(
      (a, b) => a.order - b.order,
    );

    return {
      id: section.id,
      title: section.title,
      order: section.order,
      lessons: sectionLessons.map((lesson) =>
        mapCurriculumLesson(
          lesson,
          hasFullAccess,
          attachmentsByLesson,
          linkedPostsById,
        ),
      ),
    };
  });
}

export function computeTotalDurationSeconds(lessons: LessonRecord[]): number {
  return lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
}
