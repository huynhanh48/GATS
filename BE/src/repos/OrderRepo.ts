import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from 'drizzle-orm';

import { ORDER_PAYMENT_TTL_MS } from '@src/common/constants/order-payment';
import db from '@src/db';
import {
  orderItemsTable,
  ordersTable,
  type NewOrder,
  type NewOrderItem,
  type Order,
  type OrderItem,
  type OrderStatus,
} from '@src/db/schema/order';
import { transactionsTable } from '@src/db/schema/transaction';
import { usersTable } from '@src/db/schema/user';
import {
  parseOrderItemRecord,
  parseOrderRecord,
  type OrderDetail,
  type OrderItemRecord,
  type OrderRecord,
} from '@src/models/Order.model';

export type AdminOrderListRow = {
  order: OrderRecord;
  userName: string | null;
  userEmail: string | null;
  txnRef: string | null;
  txnStatus: string | null;
};

function parseOrder(row: unknown): OrderRecord {
  return parseOrderRecord(row);
}

function parseItem(row: unknown): OrderItemRecord {
  return parseOrderItemRecord(row);
}

export async function createOrderWithItems(
  order: NewOrder,
  items: Array<Omit<NewOrderItem, 'orderId'>>,
): Promise<OrderDetail> {
  return db.transaction(async (tx) => {
    const orderRows = await tx.insert(ordersTable).values(order).returning();
    const created = orderRows[0];
    const itemRows = items.length > 0
      ? await tx
          .insert(orderItemsTable)
          .values(items.map((item) => ({ ...item, orderId: created.id })))
          .returning()
      : [];

    return {
      ...parseOrder(created),
      items: itemRows.map(parseItem),
    };
  });
}

export async function findById(id: string): Promise<OrderRecord | undefined> {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);
  return rows[0] ? parseOrder(rows[0]) : undefined;
}

export async function findByIdWithItems(
  id: string,
): Promise<OrderDetail | undefined> {
  const order = await findById(id);
  if (!order) return undefined;
  const items = await listItemsByOrderId(id);
  return { ...order, items };
}

export async function listByUserId(userId: number): Promise<OrderRecord[]> {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));
  return rows.map(parseOrder);
}

export async function hasPaidPrompt(userId: number, itemKey: string): Promise<boolean> {
  const rows = await db.select({ id: ordersTable.id }).from(ordersTable).where(and(
    eq(ordersTable.userId, userId),
    eq(ordersTable.status, 'paid'),
    eq(ordersTable.promptItemKey, itemKey),
  )).limit(1);
  return rows.length > 0;
}

export async function listItemsByOrderId(
  orderId: string,
): Promise<OrderItemRecord[]> {
  const rows = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));
  return rows.map(parseItem);
}

export async function listItemsByOrderIds(
  orderIds: string[],
): Promise<OrderItemRecord[]> {
  if (orderIds.length === 0) return [];
  const rows = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));
  return rows.map(parseItem);
}

export async function countItemsByCourseId(courseId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.courseId, courseId));
  return Number(rows[0]?.value ?? 0);
}

export async function updateStatus(
  id: string,
  status: OrderStatus,
  extra: Partial<{
    paidAt: Date | null;
    paymentMethod: Order['paymentMethod'];
    refundReasonCode: string | null;
    refundReasonNote: string | null;
    refundBankName: string | null;
    refundAccountNumber: string | null;
    refundAccountHolder: string | null;
    refundRequestedAt: Date | null;
    refundCompletedAt: Date | null;
  }> = {},
): Promise<OrderRecord | undefined> {
  const rows = await db
    .update(ordersTable)
    .set({
      status,
      updatedAt: new Date(),
      ...(extra.paidAt !== undefined ? { paidAt: extra.paidAt } : {}),
      ...(extra.paymentMethod !== undefined
        ? { paymentMethod: extra.paymentMethod }
        : {}),
      ...(extra.refundReasonCode !== undefined
        ? { refundReasonCode: extra.refundReasonCode }
        : {}),
      ...(extra.refundReasonNote !== undefined
        ? { refundReasonNote: extra.refundReasonNote }
        : {}),
      ...(extra.refundBankName !== undefined
        ? { refundBankName: extra.refundBankName }
        : {}),
      ...(extra.refundAccountNumber !== undefined
        ? { refundAccountNumber: extra.refundAccountNumber }
        : {}),
      ...(extra.refundAccountHolder !== undefined
        ? { refundAccountHolder: extra.refundAccountHolder }
        : {}),
      ...(extra.refundRequestedAt !== undefined
        ? { refundRequestedAt: extra.refundRequestedAt }
        : {}),
      ...(extra.refundCompletedAt !== undefined
        ? { refundCompletedAt: extra.refundCompletedAt }
        : {}),
    })
    .where(eq(ordersTable.id, id))
    .returning();
  return rows[0] ? parseOrder(rows[0]) : undefined;
}

export async function markPaid(
  id: string,
  paymentMethod?: Order['paymentMethod'],
): Promise<OrderRecord | undefined> {
  return updateStatus(id, 'paid', {
    paidAt: new Date(),
    paymentMethod,
  });
}

export async function cancelIfPending(
  id: string,
  userId: number,
): Promise<OrderRecord | undefined> {
  const rows = await db
    .update(ordersTable)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(
      and(
        eq(ordersTable.id, id),
        eq(ordersTable.userId, userId),
        eq(ordersTable.status, 'pending'),
      ),
    )
    .returning();
  return rows[0] ? parseOrder(rows[0]) : undefined;
}

/** Admin cancel — no ownership check */
export async function cancelIfPendingById(
  id: string,
): Promise<OrderRecord | undefined> {
  const rows = await db
    .update(ordersTable)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(ordersTable.id, id), eq(ordersTable.status, 'pending')))
    .returning();
  return rows[0] ? parseOrder(rows[0]) : undefined;
}

export async function listAdmin(options: {
  skip?: number;
  take?: number;
  status?: OrderStatus;
  q?: string;
  expiredBefore?: Date;
}): Promise<{ data: AdminOrderListRow[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));
  const q = options.q?.trim();

  const conditions = [];
  if (options.status) {
    conditions.push(eq(ordersTable.status, options.status));
  }
  if (options.expiredBefore) {
    conditions.push(eq(ordersTable.status, 'pending'));
    conditions.push(lt(ordersTable.createdAt, options.expiredBefore));
  }
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        ilike(ordersTable.customerName, term),
        ilike(ordersTable.customerEmail, term),
        ilike(ordersTable.customerPhone, term),
        ilike(usersTable.userName, term),
        ilike(usersTable.email, term),
        ilike(transactionsTable.txnRef, term),
        sql`${ordersTable.id}::text ilike ${term}`,
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const base = db
    .select({
      order: ordersTable,
      userName: usersTable.userName,
      userEmail: usersTable.email,
      txnRef: transactionsTable.txnRef,
      txnStatus: transactionsTable.status,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(
      transactionsTable,
      eq(transactionsTable.orderId, ordersTable.id),
    );

  const countBase = db
    .select({ value: count() })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(
      transactionsTable,
      eq(transactionsTable.orderId, ordersTable.id),
    );

  const [rows, totalRow] = await Promise.all([
    (where ? base.where(where) : base)
      .orderBy(desc(ordersTable.createdAt))
      .limit(take)
      .offset(skip),
    where ? countBase.where(where) : countBase,
  ]);

  return {
    data: rows.map((row) => ({
      order: parseOrder(row.order),
      userName: row.userName,
      userEmail: row.userEmail,
      txnRef: row.txnRef,
      txnStatus: row.txnStatus,
    })),
    total: Number(totalRow[0]?.value ?? 0),
  };
}

export async function countByStatus(): Promise<
  Record<OrderStatus, number> & { all: number; expiredPending: number }
> {
  const [rows, expiredRow] = await Promise.all([
    db
      .select({
        status: ordersTable.status,
        value: count(),
      })
      .from(ordersTable)
      .groupBy(ordersTable.status),
    db
      .select({ value: count() })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.status, 'pending'),
          lt(
            ordersTable.createdAt,
            new Date(Date.now() - ORDER_PAYMENT_TTL_MS),
          ),
        ),
      ),
  ]);

  const result: Record<OrderStatus, number> & {
    all: number;
    expiredPending: number;
  } = {
    pending: 0,
    paid: 0,
    cancelled: 0,
    refund_pending: 0,
    refunded: 0,
    all: 0,
    expiredPending: Number(expiredRow[0]?.value ?? 0),
  };

  for (const row of rows) {
    const n = Number(row.value ?? 0);
    result[row.status] = n;
    result.all += n;
  }

  return result;
}

export async function sumPaidAmount(since?: Date): Promise<number> {
  const where = since
    ? and(eq(ordersTable.status, 'paid'), gte(ordersTable.paidAt, since))
    : eq(ordersTable.status, 'paid');

  const rows = await db
    .select({ value: sql<number>`coalesce(sum(${ordersTable.totalAmount}), 0)` })
    .from(ordersTable)
    .where(where);

  return Number(rows[0]?.value ?? 0);
}

/** For CSV export — same filters as listAdmin but capped at a higher limit, no pagination. */
export async function listForExport(options: {
  status?: OrderStatus;
  q?: string;
  limit?: number;
}): Promise<AdminOrderListRow[]> {
  const take = Math.min(5000, Math.max(1, options.limit ?? 5000));
  const q = options.q?.trim();

  const conditions = [];
  if (options.status) {
    conditions.push(eq(ordersTable.status, options.status));
  }
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        ilike(ordersTable.customerName, term),
        ilike(ordersTable.customerEmail, term),
        ilike(ordersTable.customerPhone, term),
        ilike(usersTable.userName, term),
        ilike(usersTable.email, term),
        ilike(transactionsTable.txnRef, term),
        sql`${ordersTable.id}::text ilike ${term}`,
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const base = db
    .select({
      order: ordersTable,
      userName: usersTable.userName,
      userEmail: usersTable.email,
      txnRef: transactionsTable.txnRef,
      txnStatus: transactionsTable.status,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(transactionsTable, eq(transactionsTable.orderId, ordersTable.id));

  const rows = await (where ? base.where(where) : base)
    .orderBy(desc(ordersTable.createdAt))
    .limit(take);

  return rows.map((row) => ({
    order: parseOrder(row.order),
    userName: row.userName,
    userEmail: row.userEmail,
    txnRef: row.txnRef,
    txnStatus: row.txnStatus,
  }));
}

export type { Order, OrderItem };
