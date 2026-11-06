import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { CommentStatus } from '@src/db/schema/comment';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as CommentRepo from '@src/repos/CommentRepo';

const Errors = {
  NOT_FOUND: 'Comment not found',
  INVALID_STATUS: 'Trạng thái không hợp lệ cho kiểm duyệt',
} as const;

async function listQueue(query: {
  page?: number;
  limit?: number;
  status?: CommentStatus;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const [{ data, total }, counts] = await Promise.all([
    CommentRepo.listForModeration({ skip, take: limit, status: query.status }),
    CommentRepo.countByStatus(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    counts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

async function updateStatus(
  commentId: string,
  status: CommentStatus,
  actorUserId?: number,
) {
  if (!['visible', 'hidden', 'deleted'].includes(status)) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_STATUS);
  }

  const existing = await CommentRepo.findById(commentId);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const updated = await CommentRepo.update(commentId, { status });
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (existing.status !== status) {
    await AuditLogRepo.record({
      actorUserId,
      action: 'comment.moderation_status_changed',
      resourceType: 'comment',
      resourceId: commentId,
      meta: { from: existing.status, to: status },
    });
  }

  return { comment: updated, message: 'Đã cập nhật trạng thái bình luận' };
}

export default {
  Errors,
  listQueue,
  updateStatus,
};
