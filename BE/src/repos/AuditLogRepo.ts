import { and, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  auditLogsTable,
  type AuditLog,
  type NewAuditLog,
} from '@src/db/schema/audit-log';

export async function create(
  data: Omit<NewAuditLog, 'id' | 'createdAt'>,
): Promise<AuditLog> {
  const rows = await db.insert(auditLogsTable).values(data).returning();
  return rows[0];
}

export async function listByResource(options: {
  resourceType: string;
  resourceId: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const limit = Math.min(100, Math.max(1, options.limit ?? 50));
  return db
    .select()
    .from(auditLogsTable)
    .where(
      and(
        eq(auditLogsTable.resourceType, options.resourceType),
        eq(auditLogsTable.resourceId, options.resourceId),
      ),
    )
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit);
}

/** Fire-and-forget safe write — never throws to callers. */
export async function record(data: {
  actorUserId?: number | null;
  action: string;
  resourceType: string;
  resourceId: string;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await create({
      actorUserId: data.actorUserId ?? null,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      meta: data.meta ?? null,
    });
  } catch (err) {
    console.error('AuditLog write failed', err);
  }
}
