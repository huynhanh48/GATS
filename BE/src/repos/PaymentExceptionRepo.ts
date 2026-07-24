import { and, count, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  paymentExceptionsTable,
  type NewPaymentException,
  type PaymentException,
  type PaymentExceptionType,
} from '@src/db/schema/payment-exception';
import { ordersTable } from '@src/db/schema/order';

export type PaymentExceptionRow = PaymentException & {
  orderCustomerName: string | null;
  orderCustomerEmail: string | null;
  orderTotalAmount: number | null;
};

export async function findUnresolvedByTxnRefAndType(
  txnRef: string,
  type: PaymentExceptionType,
): Promise<PaymentException | undefined> {
  const rows = await db
    .select()
    .from(paymentExceptionsTable)
    .where(
      and(
        eq(paymentExceptionsTable.txnRef, txnRef),
        eq(paymentExceptionsTable.type, type),
        eq(paymentExceptionsTable.resolved, false),
      ),
    )
    .orderBy(desc(paymentExceptionsTable.createdAt))
    .limit(1);
  return rows[0];
}

export async function create(
  data: Omit<NewPaymentException, 'id' | 'createdAt' | 'resolved'>,
): Promise<PaymentException> {
  const rows = await db
    .insert(paymentExceptionsTable)
    .values(data)
    .returning();
  return rows[0];
}

/**
 * One unresolved row per (txnRef, type). Concurrent webhook/poll updates the
 * same row instead of inserting duplicates.
 */
export async function upsertUnresolved(
  data: Omit<NewPaymentException, 'id' | 'createdAt' | 'resolved'>,
): Promise<PaymentException> {
  if (!data.txnRef) {
    return create(data);
  }

  try {
    return await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(paymentExceptionsTable)
        .where(
          and(
            eq(paymentExceptionsTable.txnRef, data.txnRef!),
            eq(paymentExceptionsTable.type, data.type),
            eq(paymentExceptionsTable.resolved, false),
          ),
        )
        .for('update')
        .limit(1);

      if (existing[0]) {
        const rows = await tx
          .update(paymentExceptionsTable)
          .set({
            orderId: data.orderId ?? existing[0].orderId,
            expectedAmount: data.expectedAmount ?? existing[0].expectedAmount,
            actualAmount: data.actualAmount ?? existing[0].actualAmount,
            rawPayload: data.rawPayload ?? existing[0].rawPayload,
          })
          .where(eq(paymentExceptionsTable.id, existing[0].id))
          .returning();
        return rows[0];
      }

      const rows = await tx
        .insert(paymentExceptionsTable)
        .values(data)
        .returning();
      return rows[0];
    });
  } catch (err) {
    // Unique partial index race: other worker inserted first — refresh that row.
    const raced = await findUnresolvedByTxnRefAndType(data.txnRef, data.type);
    if (raced) {
      const rows = await db
        .update(paymentExceptionsTable)
        .set({
          orderId: data.orderId ?? raced.orderId,
          expectedAmount: data.expectedAmount ?? raced.expectedAmount,
          actualAmount: data.actualAmount ?? raced.actualAmount,
          rawPayload: data.rawPayload ?? raced.rawPayload,
        })
        .where(eq(paymentExceptionsTable.id, raced.id))
        .returning();
      return rows[0];
    }
    throw err;
  }
}

export async function list(options: {
  skip?: number;
  take?: number;
  type?: PaymentExceptionType;
  resolved?: boolean;
}): Promise<{ data: PaymentExceptionRow[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));

  const conditions = [];
  if (options.type) {
    conditions.push(eq(paymentExceptionsTable.type, options.type));
  }
  if (options.resolved !== undefined) {
    conditions.push(eq(paymentExceptionsTable.resolved, options.resolved));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const base = db
    .select({
      exception: paymentExceptionsTable,
      orderCustomerName: ordersTable.customerName,
      orderCustomerEmail: ordersTable.customerEmail,
      orderTotalAmount: ordersTable.totalAmount,
    })
    .from(paymentExceptionsTable)
    .leftJoin(ordersTable, eq(paymentExceptionsTable.orderId, ordersTable.id));

  const countBase = db
    .select({ value: count() })
    .from(paymentExceptionsTable);

  const [rows, totalRow] = await Promise.all([
    (where ? base.where(where) : base)
      .orderBy(desc(paymentExceptionsTable.createdAt))
      .limit(take)
      .offset(skip),
    where ? countBase.where(where) : countBase,
  ]);

  return {
    data: rows.map((row) => ({
      ...row.exception,
      orderCustomerName: row.orderCustomerName,
      orderCustomerEmail: row.orderCustomerEmail,
      orderTotalAmount: row.orderTotalAmount,
    })),
    total: Number(totalRow[0]?.value ?? 0),
  };
}

export async function findById(
  id: string,
): Promise<PaymentException | undefined> {
  const rows = await db
    .select()
    .from(paymentExceptionsTable)
    .where(eq(paymentExceptionsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function resolve(
  id: string,
  resolvedById: number,
  resolutionNote?: string | null,
): Promise<PaymentException | undefined> {
  const rows = await db
    .update(paymentExceptionsTable)
    .set({
      resolved: true,
      resolvedById,
      resolvedAt: new Date(),
      resolutionNote: resolutionNote ?? null,
    })
    .where(eq(paymentExceptionsTable.id, id))
    .returning();
  return rows[0];
}

export async function countUnresolved(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(paymentExceptionsTable)
    .where(eq(paymentExceptionsTable.resolved, false));
  return Number(rows[0]?.value ?? 0);
}
