import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";

export type CourseChatMessage = {
  id: string;
  courseId: string;
  senderId: number;
  senderName: string | null;
  isMentor: boolean;
  content: string;
  pinnedAt: string | null;
  pinnedById: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCourseChat(courseId: string) {
  const response: any = await apiClient.get(PathApi.courseChat.messages(courseId));
  return {
    messages: (Array.isArray(response?.data) ? response.data : []) as CourseChatMessage[],
    canManage: Boolean(response?.meta?.canManage),
  };
}

export async function sendCourseChatMessage(courseId: string, content: string) {
  const response: any = await apiClient.post(PathApi.courseChat.messages(courseId), {
    content,
  });
  return response?.data as CourseChatMessage;
}

export async function setCourseChatMessagePinned(
  courseId: string,
  messageId: string,
  isPinned: boolean,
) {
  const response: any = await apiClient.patch(
    PathApi.courseChat.pin(courseId, messageId),
    { isPinned },
  );
  return response?.data as CourseChatMessage;
}

export async function deleteCourseChatMessage(courseId: string, messageId: string) {
  await apiClient.delete(PathApi.courseChat.message(courseId, messageId));
}
