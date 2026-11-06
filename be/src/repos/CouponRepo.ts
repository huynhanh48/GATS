import { and, count, desc, eq, ilike, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  couponRedemptionsTable,
  couponsTable,
  type Coupon,
  type NewCoupon,
  type NewCouponRedemption,
} from '@src/db/schema/coupon';

export async function create(data: NewCoupon): Promise<Coupon> {
  const rows = await db.insert(couponsTable).values(data).returning();
  return rows[0];
}

export async function findById(id: string): Promise<Coupon | undefined> {
  const rows = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByCode(code: string): Promise<Coupon | undefined> {
  const rows = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, code))
    .limit(1);
  return rows[0];
}

export async function list(options: {
  skip?: number;
  take?: number;
  q?: string;
  isActive?: boolean;
}): Promise<{ data: Coupon[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));

  const conditions = [];
  if (options.isActive !== undefined) {
    conditions.push(eq(couponsTable.isActive, options.isActive));
  }
  if (options.q?.trim()) {
    conditions.push(ilike(couponsTable.code, `%${options.q.trim()}%`));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalRow] = await Promise.all([
    db
      .select()
      .from(couponsTable)
      .where(where)
      .orderBy(desc(couponsTable.createdAt))
      .limit(take)
      .offset(skip),
    db.select({ value: count() }).from(couponsTable).where(where),
  ]);

  return { data, total: Number(totalRow[0]?.value ?? 0) };
}

export async function update(
  id: string,
  patch: Partial<
    Pick<
      Coupon,
      | 'description'
      | 'type'
      | 'scope'
      | 'membershipPlanId'
      | 'value'
      | 'maxUses'
      | 'minOrderAmount'
      | 'startsAt'
      | 'endsAt'
      | 'isActive'
    >
  >,
): Promise<Coupon | undefined> {
  const rows = await db
    .update(couponsTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(couponsTable.id, id))
    .returning();
  return rows[0];
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(couponsTable)
    .where(eq(couponsTable.id, id))
    .returning();
  return rows.length > 0;
}

/** Atomically increments usedCount. Caller must have already validated the usage limit. */
export async function incrementUsage(id: string): Promise<Coupon | undefined> {
  const rows = await db
    .update(couponsTable)
    .set({ usedCount: sql`${couponsTable.usedCount} + 1`, updatedAt: new Date() })
    .where(eq(couponsTable.id, id))
    .returning();
  return rows[0];
}

export async function createRedemption(
  data: NewCouponRedemption,
): Promise<void> {
  await db.insert(couponRedemptionsTable).values(data);
}

export async function findRedemptionByOrderId(orderId: string) {
  const rows = await db
    .select()
    .from(couponRedemptionsTable)
    .where(eq(couponRedemptionsTable.orderId, orderId))
    .limit(1);
  return rows[0];
}

export type { Coupon };
