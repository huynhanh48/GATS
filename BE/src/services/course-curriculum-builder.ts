import type {
  CourseDetailLesson,
  CourseDetailSection,
} from '@src/models/Course.model';
import type { CourseSectionRecord } from '@src/models/CourseSection.model';
import type { LessonRecord } from '@src/models/Lesson.model';
import type { LessonAttachmentPublic } from '@src/models/LessonAttachment.model';

export type AttachmentsByLesson = Map<string, LessonAttachmentPublic[]>;

export function isLessonUnlocked(
  lesson: Pick<LessonRecord, 'isPreview'>,
  hasFullAccess: boolean,
): boolean {
  return hasFullAccess || lesson.isPreview;
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

export function mapDetailLesson(
  lesson: LessonRecord,
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
): CourseDetailLesson {
  const unlocked = isLessonUnlocked(lesson, hasFullAccess);
  const attachments = attachmentsByLesson?.get(lesson.id) ?? [];
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    order: lesson.order,
    isPreview: lesson.isPreview,
    duration: lesson.duration,
    ...(unlocked ? { content: lesson.content } : {}),
    ...(unlocked ? { attachments } : {}),
    locked: !unlocked,
  };
}

export function mapCurriculumLesson(
  lesson: LessonRecord,
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
): {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  isPreview: boolean;
  duration: number | null;
  content?: string | null;
  attachments?: LessonAttachmentPublic[];
  locked: boolean;
} {
  const unlocked = isLessonUnlocked(lesson, hasFullAccess);
  const attachments = attachmentsByLesson?.get(lesson.id) ?? [];
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    order: lesson.order,
    isPreview: lesson.isPreview,
    duration: lesson.duration,
    ...(unlocked ? { content: lesson.content } : {}),
    ...(unlocked ? { attachments } : {}),
    locked: !unlocked,
  };
}

export function buildDetailSections(
  sections: CourseSectionRecord[],
  lessons: LessonRecord[],
  hasFullAccess: boolean,
  attachmentsByLesson?: AttachmentsByLesson,
): CourseDetailSection[] {
  const lessonsBySectionId = groupLessonsBySectionId(lessons);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return sortedSections.map((section) => {
    const sectionLessons = (lessonsBySectionId.get(section.id) ?? []).sort(
      (a, b) => a.order - b.order,
    );
    const mappedLessons = sectionLessons.map((lesson) =>
      mapDetailLesson(lesson, hasFullAccess, attachmentsByLesson),
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
        mapCurriculumLesson(lesson, hasFullAccess, attachmentsByLesson),
      ),
    };
  });
}

export function computeTotalDurationSeconds(lessons: LessonRecord[]): number {
  return lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
}
