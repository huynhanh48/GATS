import { and, count, desc, eq, inArray, isNull, or } from 'drizzle-orm';

import db from '@src/db';
import {
  notificationsTable,
  type NewNotification,
  type Notification,
} from '@src/db/schema/notification';

export async function create(data: NewNotification): Promise<Notification> {
  const rows = await db.insert(notificationsTable).values(data).returning();
  return rows[0];
}

/** Learner inbox: only rows addressed to this user or global admin broadcasts. */
function learnerScope(userId: number) {
  return or(
    eq(notificationsTable.userId, userId),
    eq(notificationsTable.type, 'admin_broadcast'),
  )!;
}

/**
 * Admin inbox: personal + global system/composer rows (user_id IS NULL).
 * Matches historical admin dashboard feed.
 */
function adminScope(userId: number) {
  return or(
    eq(notificationsTable.userId, userId),
    isNull(notificationsTable.userId),
  )!;
}

export async function list(options: {
  skip?: number;
  take?: number;
  unreadOnly?: boolean;
  source?: 'system' | 'admin';
  userId?: number;
  /** When true (default), exclude admin-only null-userId events. */
  learnerOnly?: boolean;
}): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));
  const learnerOnly = options.learnerOnly !== false;

  const conditions = [];
  if (options.unreadOnly) {
    conditions.push(eq(notificationsTable.isRead, false));
  }
  if (options.source) {
    conditions.push(eq(notificationsTable.source, options.source));
  }
  if (options.userId != null) {
    conditions.push(
      learnerOnly ? learnerScope(options.userId) : adminScope(options.userId),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const unreadParts = [eq(notificationsTable.isRead, false)];
  if (options.userId != null) {
    unreadParts.push(
      learnerOnly ? learnerScope(options.userId) : adminScope(options.userId),
    );
  }

  const [data, totalRow, unreadRow] = await Promise.all([
    db
      .select()
      .from(notificationsTable)
      .where(where)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(take)
      .offset(skip),
    db.select({ value: count() }).from(notificationsTable).where(where),
    db
      .select({ value: count() })
      .from(notificationsTable)
      .where(and(...unreadParts)),
  ]);

  // #region agent log
  fetch('http://127.0.0.1:7478/ingest/7736cfe9-19e3-48a4-bda2-2df998e350f8', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '8de856',
    },
    body: JSON.stringify({
      sessionId: '8de856',
      runId: 'notif-filter',
      hypothesisId: 'H-notif-admin-leak',
      location: 'NotificationRepo.list',
      message: 'notification list scope',
      data: {
        userId: options.userId ?? null,
        learnerOnly,
        returned: data.length,
        types: data.slice(0, 8).map((r) => ({
          type: r.type,
          source: r.source,
          userId: r.userId,
        })),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => undefined);
  // #endregion

  return {
    data,
    total: Number(totalRow[0]?.value ?? 0),
    unreadCount: Number(unreadRow[0]?.value ?? 0),
  };
}

export async function markRead(
  ids?: string[],
  userId?: number,
  learnerOnly = true,
): Promise<number> {
  const scope =
    userId != null
      ? learnerOnly
        ? learnerScope(userId)
        : adminScope(userId)
      : undefined;

  if (ids && ids.length > 0) {
    const rows = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.isRead, false),
          inArray(notificationsTable.id, ids),
          scope,
        ),
      )
      .returning({ id: notificationsTable.id });
    return rows.length;
  }

  const rows = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.isRead, false), scope))
    .returning({ id: notificationsTable.id });
  return rows.length;
}

export async function markOneRead(
  id: string,
  userId: number,
  learnerOnly = true,
): Promise<boolean> {
  const rows = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationsTable.id, id),
        learnerOnly ? learnerScope(userId) : adminScope(userId),
      ),
    )
    .returning({ id: notificationsTable.id });
  return rows.length > 0;
}

export async function countUnreadForUser(
  userId: number,
  learnerOnly = true,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.isRead, false),
        learnerOnly ? learnerScope(userId) : adminScope(userId),
      ),
    );
  return Number(row?.value ?? 0);
}
