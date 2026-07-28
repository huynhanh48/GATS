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

export async function list(options: {
  skip?: number;
  take?: number;
  unreadOnly?: boolean;
  source?: 'system' | 'admin';
  userId?: number;
}): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));

  const conditions = [];
  if (options.unreadOnly) {
    conditions.push(eq(notificationsTable.isRead, false));
  }
  if (options.source) {
    conditions.push(eq(notificationsTable.source, options.source));
  }
  if (options.userId != null) {
    conditions.push(
      or(
        eq(notificationsTable.userId, options.userId),
        isNull(notificationsTable.userId),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const unreadParts = [eq(notificationsTable.isRead, false)];
  if (options.userId != null) {
    unreadParts.push(
      or(
        eq(notificationsTable.userId, options.userId),
        isNull(notificationsTable.userId),
      )!,
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

  return {
    data,
    total: Number(totalRow[0]?.value ?? 0),
    unreadCount: Number(unreadRow[0]?.value ?? 0),
  };
}

export async function markRead(
  ids?: string[],
  userId?: number,
): Promise<number> {
  const scope =
    userId != null
      ? or(
          eq(notificationsTable.userId, userId),
          isNull(notificationsTable.userId),
        )
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
): Promise<boolean> {
  const rows = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationsTable.id, id),
        or(
          eq(notificationsTable.userId, userId),
          isNull(notificationsTable.userId),
        ),
      ),
    )
    .returning({ id: notificationsTable.id });
  return rows.length > 0;
}
