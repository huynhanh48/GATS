import { and, desc, eq, inArray } from 'drizzle-orm';

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
import {
  parseOrderItemRecord,
  parseOrderRecord,
  type OrderDetail,
  type OrderItemRecord,
  type OrderRecord,
} from '@src/models/Order.model';

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
    const itemRows = await tx
      .insert(orderItemsTable)
      .values(items.map((item) => ({ ...item, orderId: created.id })))
      .returning();

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

export async function updateStatus(
  id: string,
  status: OrderStatus,
  extra: Partial<{
    paidAt: Date | null;
    paymentMethod: Order['paymentMethod'];
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

export type { Order, OrderItem };
