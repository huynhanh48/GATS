import { and, count, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';

import db from '@src/db';
import {
  leadsTable,
  type Lead,
  type LeadStatus,
  type NewLead,
} from '@src/db/schema/lead';
import { usersTable } from '@src/db/schema/user';

export async function create(data: NewLead): Promise<Lead> {
  const rows = await db.insert(leadsTable).values(data).returning();
  return rows[0];
}

export async function findById(id: string): Promise<Lead | undefined> {
  const rows = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.id, id))
    .limit(1);
  return rows[0];
}

export type LeadListRow = Lead & {
  assigneeName: string | null;
};

export async function list(options: {
  skip?: number;
  take?: number;
  q?: string;
  status?: LeadStatus;
  createdFrom?: Date;
  createdTo?: Date;
}): Promise<{ data: LeadListRow[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));
  const q = options.q?.trim();

  const conditions = [];
  if (options.status) {
    conditions.push(eq(leadsTable.status, options.status));
  }
  if (options.createdFrom) {
    conditions.push(gte(leadsTable.createdAt, options.createdFrom));
  }
  if (options.createdTo) {
    conditions.push(lte(leadsTable.createdAt, options.createdTo));
  }
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        ilike(leadsTable.name, term),
        ilike(leadsTable.phone, term),
        ilike(leadsTable.email, term),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalRow] = await Promise.all([
    db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        phone: leadsTable.phone,
        email: leadsTable.email,
        message: leadsTable.message,
        source: leadsTable.source,
        status: leadsTable.status,
        assigneeUserId: leadsTable.assigneeUserId,
        notes: leadsTable.notes,
        createdAt: leadsTable.createdAt,
        updatedAt: leadsTable.updatedAt,
        assigneeName: usersTable.userName,
      })
      .from(leadsTable)
      .leftJoin(usersTable, eq(leadsTable.assigneeUserId, usersTable.id))
      .where(where)
      .orderBy(desc(leadsTable.createdAt))
      .limit(take)
      .offset(skip),
    db.select({ value: count() }).from(leadsTable).where(where),
  ]);

  return {
    data,
    total: Number(totalRow[0]?.value ?? 0),
  };
}

export async function update(
  id: string,
  patch: Partial<
    Pick<Lead, 'status' | 'assigneeUserId' | 'notes' | 'name' | 'phone' | 'email'>
  >,
): Promise<Lead | undefined> {
  const rows = await db
    .update(leadsTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(leadsTable.id, id))
    .returning();
  return rows[0];
}

export async function countByStatus(): Promise<
  Record<LeadStatus, number> & { all: number }
> {
  const rows = await db
    .select({
      status: leadsTable.status,
      value: count(),
    })
    .from(leadsTable)
    .groupBy(leadsTable.status);

  const result: Record<LeadStatus, number> & { all: number } = {
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    spam: 0,
    all: 0,
  };

  for (const row of rows) {
    const n = Number(row.value ?? 0);
    result[row.status] = n;
    result.all += n;
  }

  return result;
}
