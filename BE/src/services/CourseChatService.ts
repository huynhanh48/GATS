import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateCourseChatMessageInput,
  PinCourseChatMessageInput,
} from '@src/models/CourseChat.model';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as CourseChatRepo from '@src/repos/CourseChatRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  FORBIDDEN: 'Bạn cần đăng ký khóa học để tham gia nhóm chat',
  MESSAGE_NOT_FOUND: 'Không tìm thấy tin nhắn',
  MANAGE_FORBIDDEN: 'Chỉ mentor hoặc quản trị viên được thực hiện thao tác này',
  COURSE_NOT_FOUND: 'Không tìm thấy khóa học',
  COURSE_DELETED: 'Khóa học đã bị xóa',
} as const;

async function assertMember(userId: number, courseId: string) {
  const course = await CourseRepo.findById(courseId, { deleted: 'with' });
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }
  if (course.deletedAt) {
    throw new RouteError(HttpStatusCodes.GONE, Errors.COURSE_DELETED);
  }

  const canManage = await CourseAccessService.canManageCourse(userId, courseId);
  if (canManage) return { canManage: true };
  if (await CourseAccessService.isEnrolled(userId, courseId)) {
    return { canManage: false };
  }
  throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
}

async function list(userId: number, courseId: string) {
  const membership = await assertMember(userId, courseId);
  const messages = await CourseChatRepo.listByCourse(courseId);
  return { data: messages, meta: membership };
}

async function send(
  userId: number,
  userName: string,
  courseId: string,
  input: CreateCourseChatMessageInput,
) {
  const membership = await assertMember(userId, courseId);
  const message = await CourseChatRepo.create({
    courseId,
    senderId: userId,
    content: input.content,
  });
  return {
    data: { ...message, senderName: userName },
    meta: membership,
  };
}

async function pin(
  userId: number,
  courseId: string,
  messageId: string,
  input: PinCourseChatMessageInput,
) {
  const membership = await assertMember(userId, courseId);
  if (!membership.canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.MANAGE_FORBIDDEN);
  }
  const message = await CourseChatRepo.setPinned(
    courseId,
    messageId,
    userId,
    input.isPinned,
  );
  if (!message) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.MESSAGE_NOT_FOUND);
  }
  return { data: message };
}

async function remove(userId: number, courseId: string, messageId: string) {
  const membership = await assertMember(userId, courseId);
  const message = await CourseChatRepo.findById(courseId, messageId);
  if (!message) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.MESSAGE_NOT_FOUND);
  }
  if (!membership.canManage && message.senderId !== userId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.MANAGE_FORBIDDEN);
  }
  await CourseChatRepo.remove(courseId, messageId);
  return { message: 'Đã xóa tin nhắn' };
}

export default { Errors, list, send, pin, remove };
