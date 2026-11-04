import { and, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  membershipPlansTable,
  userMembershipsTable,
  type NewMembershipPlan,
  type NewUserMembership,
} from '@src/db/schema/membership';
import { usersTable } from '@src/db/schema/user';

export async function listPlans() {
  return db
    .select()
    .from(membershipPlansTable)
    .orderBy(membershipPlansTable.displayOrder, membershipPlansTable.createdAt);
}

export async function findPlanById(id: string) {
  const rows = await db
    .select()
    .from(membershipPlansTable)
    .where(eq(membershipPlansTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findPlanByCode(code: string) {
  const rows = await db
    .select()
    .from(membershipPlansTable)
    .where(eq(membershipPlansTable.code, code))
    .limit(1);
  return rows[0];
}

export async function createPlan(data: NewMembershipPlan) {
  const rows = await db.insert(membershipPlansTable).values(data).returning();
  return rows[0];
}

export async function updatePlan(
  id: string,
  data: Partial<Omit<NewMembershipPlan, 'id' | 'code' | 'createdAt'>>,
) {
  const rows = await db
    .update(membershipPlansTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(membershipPlansTable.id, id))
    .returning();
  return rows[0];
}

export async function listMemberships(options: {
  skip: number;
  take: number;
  q?: string;
  status?: 'active' | 'cancelled' | 'expired' | 'revoked';
  planId?: string;
}) {
  const filters = [];
  if (options.status) filters.push(eq(userMembershipsTable.status, options.status));
  if (options.planId) filters.push(eq(userMembershipsTable.planId, options.planId));
  if (options.q) {
    const text = `%${options.q}%`;
    const numericId = Number(options.q);
    filters.push(
      or(
        ilike(usersTable.email, text),
        ilike(usersTable.userName, text),
        ...(Number.isInteger(numericId) && numericId > 0
          ? [eq(usersTable.id, numericId)]
          : []),
      )!,
    );
  }
  const where = filters.length > 0 ? and(...filters) : undefined;
  const base = db
    .select({
      id: userMembershipsTable.id,
      userId: userMembershipsTable.userId,
      userName: usersTable.userName,
      userEmail: usersTable.email,
      planId: userMembershipsTable.planId,
      planCode: membershipPlansTable.code,
      planName: membershipPlansTable.name,
      billingInterval: userMembershipsTable.billingInterval,
      status: userMembershipsTable.status,
      source: userMembershipsTable.source,
      startedAt: userMembershipsTable.startedAt,
      currentPeriodStart: userMembershipsTable.currentPeriodStart,
      currentPeriodEnd: userMembershipsTable.currentPeriodEnd,
      cancelAtPeriodEnd: userMembershipsTable.cancelAtPeriodEnd,
      priceSnapshot: userMembershipsTable.priceSnapshot,
      grantedBy: userMembershipsTable.grantedBy,
      grantReason: userMembershipsTable.grantReason,
      revokedBy: userMembershipsTable.revokedBy,
      revokedAt: userMembershipsTable.revokedAt,
      revokeReason: userMembershipsTable.revokeReason,
      createdAt: userMembershipsTable.createdAt,
      updatedAt: userMembershipsTable.updatedAt,
    })
    .from(userMembershipsTable)
    .innerJoin(usersTable, eq(userMembershipsTable.userId, usersTable.id))
    .innerJoin(
      membershipPlansTable,
      eq(userMembershipsTable.planId, membershipPlansTable.id),
    );
  const data = await base
    .where(where)
    .orderBy(desc(userMembershipsTable.createdAt))
    .limit(options.take)
    .offset(options.skip);
  const totals = await db
    .select({ value: count() })
    .from(userMembershipsTable)
    .innerJoin(usersTable, eq(userMembershipsTable.userId, usersTable.id))
    .where(where);
  return { data, total: Number(totals[0]?.value ?? 0) };
}

export async function findMembershipById(id: string) {
  const rows = await db
    .select()
    .from(userMembershipsTable)
    .where(eq(userMembershipsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function revokeActiveForUser(userId: number, actorId: number, reason: string) {
  return db
    .update(userMembershipsTable)
    .set({
      status: 'revoked',
      revokedBy: actorId,
      revokedAt: new Date(),
      revokeReason: reason,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userMembershipsTable.userId, userId),
        inArray(userMembershipsTable.status, ['active', 'cancelled']),
      ),
    )
    .returning();
}

export async function createMembership(data: NewUserMembership) {
  const rows = await db.insert(userMembershipsTable).values(data).returning();
  return rows[0];
}

export async function updateMembership(
  id: string,
  data: Partial<Omit<NewUserMembership, 'id' | 'userId' | 'createdAt'>>,
) {
  const rows = await db
    .update(userMembershipsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userMembershipsTable.id, id))
    .returning();
  return rows[0];
}

export async function countActiveByPlans() {
  const now = new Date();
  const rows = await db
    .select({ planId: userMembershipsTable.planId, value: count() })
    .from(userMembershipsTable)
    .where(
      and(
        eq(userMembershipsTable.status, 'active'),
        or(
          sql`${userMembershipsTable.currentPeriodEnd} IS NULL`,
          sql`${userMembershipsTable.currentPeriodEnd} > ${now}`,
        ),
      ),
    )
    .groupBy(userMembershipsTable.planId);
  return new Map(rows.map((row) => [row.planId, Number(row.value)]));
}
