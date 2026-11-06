import { and, count, desc, eq, gte, sql, sum } from 'drizzle-orm';

import db from '@src/db';
import { certificatesTable } from '@src/db/schema/certificate';
import { couponRedemptionsTable } from '@src/db/schema/coupon';
import { coursesTable } from '@src/db/schema/course';
import { courseEnrollmentsTable } from '@src/db/schema/enrollment';
import { orderItemsTable, ordersTable } from '@src/db/schema/order';
import { usersTable } from '@src/db/schema/user';

export async function getRevenueSummary(): Promise<{
  totalRevenue: number;
  totalPaidOrders: number;
  last30dRevenue: number;
  last30dPaidOrders: number;
}> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [allTime, recent] = await Promise.all([
    db
      .select({
        revenue: sum(ordersTable.totalAmount),
        orders: count(),
      })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'paid')),
    db
      .select({
        revenue: sum(ordersTable.totalAmount),
        orders: count(),
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.status, 'paid'), gte(ordersTable.paidAt, since))),
  ]);

  return {
    totalRevenue: Number(allTime[0]?.revenue ?? 0),
    totalPaidOrders: Number(allTime[0]?.orders ?? 0),
    last30dRevenue: Number(recent[0]?.revenue ?? 0),
    last30dPaidOrders: Number(recent[0]?.orders ?? 0),
  };
}

export async function getUserCount(): Promise<number> {
  const rows = await db.select({ value: count() }).from(usersTable);
  return Number(rows[0]?.value ?? 0);
}

export async function getEnrollmentCount(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(courseEnrollmentsTable)
    .where(eq(courseEnrollmentsTable.status, 'active'));
  return Number(rows[0]?.value ?? 0);
}

export async function getCertificateCount(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(certificatesTable)
    .where(eq(certificatesTable.status, 'issued'));
  return Number(rows[0]?.value ?? 0);
}

export async function getCouponRedemptionSummary(): Promise<{
  redemptions: number;
  totalDiscount: number;
}> {
  const rows = await db
    .select({
      redemptions: count(),
      totalDiscount: sum(couponRedemptionsTable.discountAmount),
    })
    .from(couponRedemptionsTable);
  return {
    redemptions: Number(rows[0]?.redemptions ?? 0),
    totalDiscount: Number(rows[0]?.totalDiscount ?? 0),
  };
}

export type TopCourseRow = {
  courseId: string;
  title: string | null;
  sales: number;
  revenue: number;
};

export async function getTopCoursesBySales(limit = 5): Promise<TopCourseRow[]> {
  const rows = await db
    .select({
      courseId: orderItemsTable.courseId,
      title: coursesTable.title,
      sales: count(orderItemsTable.id),
      revenue: sum(orderItemsTable.price),
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .leftJoin(coursesTable, eq(orderItemsTable.courseId, coursesTable.id))
    .where(eq(ordersTable.status, 'paid'))
    .groupBy(orderItemsTable.courseId, coursesTable.title)
    .orderBy(desc(sql`count(${orderItemsTable.id})`))
    .limit(limit);

  return rows.map((row) => ({
    courseId: row.courseId,
    title: row.title,
    sales: Number(row.sales ?? 0),
    revenue: Number(row.revenue ?? 0),
  }));
}

export async function getRevenueByDay(days = 14): Promise<
  Array<{ date: string; revenue: number; orders: number }>
> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      date: sql<string>`to_char(${ordersTable.paidAt}, 'YYYY-MM-DD')`,
      revenue: sum(ordersTable.totalAmount),
      orders: count(),
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.status, 'paid'), gte(ordersTable.paidAt, since)))
    .groupBy(sql`to_char(${ordersTable.paidAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${ordersTable.paidAt}, 'YYYY-MM-DD')`);

  return rows.map((row) => ({
    date: row.date,
    revenue: Number(row.revenue ?? 0),
    orders: Number(row.orders ?? 0),
  }));
}
