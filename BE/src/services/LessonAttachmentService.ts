import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  AttachLessonMediaInput,
  LessonAttachmentPublic,
} from '@src/models/LessonAttachment.model';
import * as LessonAttachmentRepo from '@src/repos/LessonAttachmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import MediaService from '@src/services/MediaService';

const Errors = {
  LESSON_NOT_FOUND: 'Lesson not found',
  ATTACHMENT_NOT_FOUND: 'Attachment not found',
  ALREADY_ATTACHED: 'This file is already attached to the lesson',
  INVALID_MEDIA_KIND: 'Only file media can be attached to a lesson',
} as const;

type UploadedMulterFile = {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
};

async function assertLessonInCourse(courseId: string, lessonId: string) {
  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }
  return lesson;
}

async function list(
  courseId: string,
  lessonId: string,
): Promise<LessonAttachmentPublic[]> {
  await assertLessonInCourse(courseId, lessonId);
  return LessonAttachmentRepo.listByLesson(lessonId);
}

async function attach(
  courseId: string,
  lessonId: string,
  input: AttachLessonMediaInput,
): Promise<LessonAttachmentPublic> {
  await assertLessonInCourse(courseId, lessonId);

  const media = await MediaService.getById(input.mediaId);
  if (media.kind !== 'file') {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_MEDIA_KIND,
    );
  }

  const existing = await LessonAttachmentRepo.findByLessonAndMedia(
    lessonId,
    input.mediaId,
  );
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ATTACHED);
  }

  const order = await LessonAttachmentRepo.getNextOrder(lessonId);
  return LessonAttachmentRepo.create({
    lessonId,
    mediaId: input.mediaId,
    title: input.title ?? null,
    order,
  });
}

async function uploadAndAttach(
  courseId: string,
  lessonId: string,
  file: UploadedMulterFile | undefined,
  userId: number | undefined,
): Promise<LessonAttachmentPublic> {
  await assertLessonInCourse(courseId, lessonId);

  const media = await MediaService.uploadFile(file, userId);

  const order = await LessonAttachmentRepo.getNextOrder(lessonId);
  return LessonAttachmentRepo.create({
    lessonId,
    mediaId: media.id,
    title: null,
    order,
  });
}

async function remove(
  courseId: string,
  lessonId: string,
  attachmentId: string,
): Promise<{ message: string }> {
  await assertLessonInCourse(courseId, lessonId);

  const attachment = await LessonAttachmentRepo.findById(attachmentId);
  if (!attachment || attachment.lessonId !== lessonId) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ATTACHMENT_NOT_FOUND,
    );
  }

  // Only detach from the lesson; the media file stays in the library.
  await LessonAttachmentRepo.remove(attachmentId);
  return { message: 'Attachment removed' };
}

export default {
  Errors,
  list,
  attach,
  uploadAndAttach,
  remove,
};
