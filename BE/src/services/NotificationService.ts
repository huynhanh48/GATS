import type { NotificationType } from '@src/db/schema/notification';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as NotificationRepo from '@src/repos/NotificationRepo';

export type NotifyInput = {
  type: NotificationType;
  title: string;
  body?: string | null;
  href?: string | null;
  entityId?: string | null;
};

export type ComposeInput = {
  title: string;
  body?: string | null;
  href?: string | null;
  audienceLabel?: string | null;
};

/** Fire-and-forget admin inbox event. Never throws to callers. */
async function notify(input: NotifyInput) {
  try {
    return await NotificationRepo.create({
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      entityId: input.entityId ?? null,
      isRead: false,
      source: 'system',
    });
  } catch (err) {
    console.error('Notification create failed', err);
    return null;
  }
}

/** Admin composer — sends a broadcast notification and logs a delivery entry. */
async function compose(input: ComposeInput, actorUserId: number) {
  const created = await NotificationRepo.create({
    type: 'admin_broadcast',
    title: input.title.trim(),
    body: input.body?.trim() ? input.body.trim() : null,
    href: input.href?.trim() ? input.href.trim() : null,
    entityId: null,
    isRead: false,
    source: 'admin',
    createdByUserId: actorUserId,
    audienceLabel: input.audienceLabel?.trim() ? input.audienceLabel.trim() : 'Tất cả',
  });

  await AuditLogRepo.record({
    actorUserId,
    action: 'notification.composed',
    resourceType: 'notification',
    resourceId: created.id,
    meta: { title: created.title, audienceLabel: created.audienceLabel },
  });

  return { notification: created, message: 'Đã gửi thông báo' };
}

async function list(query: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  source?: 'system' | 'admin';
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;
  const { data, total, unreadCount } = await NotificationRepo.list({
    skip,
    take: limit,
    unreadOnly: query.unreadOnly,
    source: query.source,
  });
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  return {
    data: data.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      href: row.href,
      entityId: row.entityId,
      isRead: row.isRead,
      source: row.source,
      createdByUserId: row.createdByUserId,
      audienceLabel: row.audienceLabel,
      createdAt: row.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
    unreadCount,
  };
}

async function markRead(ids?: string[]) {
  const updated = await NotificationRepo.markRead(ids);
  return { updated, message: 'Đã đánh dấu đã đọc' };
}

export default {
  notify,
  compose,
  list,
  markRead,
};
