import { and, eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import {
  cartItemsTable,
  cartsTable,
  type Cart,
  type CartItem,
  type NewCartItem,
} from '@src/db/schema/cart';

export async function findCartByUserId(
  userId: number,
): Promise<Cart | undefined> {
  const rows = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.userId, userId))
    .limit(1);
  return rows[0];
}

export async function createCart(userId: number): Promise<Cart> {
  const rows = await db
    .insert(cartsTable)
    .values({ userId })
    .returning();
  return rows[0];
}

export async function findOrCreateCart(userId: number): Promise<Cart> {
  const existing = await findCartByUserId(userId);
  if (existing) return existing;
  return createCart(userId);
}

export async function findItemById(
  itemId: string,
): Promise<CartItem | undefined> {
  const rows = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.id, itemId))
    .limit(1);
  return rows[0];
}

export async function findItemByCartAndCourse(
  cartId: string,
  courseId: string,
): Promise<CartItem | undefined> {
  const rows = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cartId),
        eq(cartItemsTable.courseId, courseId),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function listItemsByCartId(cartId: string): Promise<CartItem[]> {
  return db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cartId));
}

export async function addItem(data: NewCartItem): Promise<CartItem> {
  const rows = await db.insert(cartItemsTable).values(data).returning();
  return rows[0];
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartItem | undefined> {
  const rows = await db
    .update(cartItemsTable)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItemsTable.id, itemId))
    .returning();
  return rows[0];
}

export async function removeItem(itemId: string): Promise<boolean> {
  const rows = await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.id, itemId))
    .returning({ id: cartItemsTable.id });
  return rows.length > 0;
}

export async function removeItemsByCourseIds(
  cartId: string,
  courseIds: string[],
): Promise<void> {
  if (courseIds.length === 0) return;
  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cartId),
        inArray(cartItemsTable.courseId, courseIds),
      ),
    );
}

export async function clearCartItems(cartId: string): Promise<void> {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
}

export async function touchCart(cartId: string): Promise<void> {
  await db
    .update(cartsTable)
    .set({ updatedAt: new Date() })
    .where(eq(cartsTable.id, cartId));
}
