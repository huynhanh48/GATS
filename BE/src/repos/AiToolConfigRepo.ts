import { and, asc, eq, inArray } from 'drizzle-orm';
import db from '@src/db';
import { aiToolConfigsTable } from '@src/db/schema/ai-tool-config';

export type AiToolType = 'prompt' | 'api_provider' | 'skill' | 'mcp' | 'tool' | 'stem';
export function findAll(type?: AiToolType) {
  return db.select().from(aiToolConfigsTable)
    .where(type ? eq(aiToolConfigsTable.type, type) : undefined)
    .orderBy(asc(aiToolConfigsTable.type), asc(aiToolConfigsTable.title));
}
export async function findByKey(type: AiToolType, itemKey: string) {
  const [row] = await db.select().from(aiToolConfigsTable)
    .where(and(eq(aiToolConfigsTable.type, type), eq(aiToolConfigsTable.itemKey, itemKey)))
    .limit(1);
  return row;
}
export async function update(type: AiToolType, itemKey: string, values: Partial<typeof aiToolConfigsTable.$inferInsert>) {
  const [row] = await db.update(aiToolConfigsTable).set({ ...values, updatedAt: new Date() })
    .where(and(eq(aiToolConfigsTable.type, type), eq(aiToolConfigsTable.itemKey, itemKey))).returning();
  return row;
}
export async function create(values: typeof aiToolConfigsTable.$inferInsert) {
  const [row] = await db.insert(aiToolConfigsTable).values(values).returning();
  return row;
}
export async function upsert(values: typeof aiToolConfigsTable.$inferInsert) {
  const [row] = await db.insert(aiToolConfigsTable).values(values)
    .onConflictDoUpdate({
      target: [aiToolConfigsTable.type, aiToolConfigsTable.itemKey],
      set: {
        title: values.title,
        isPublic: values.isPublic,
        isPaid: values.isPaid,
        websiteUrl: values.websiteUrl,
        payload: values.payload,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}
export async function remove(type: AiToolType, itemKey: string) {
  const [row] = await db.delete(aiToolConfigsTable).where(and(eq(aiToolConfigsTable.type,type),eq(aiToolConfigsTable.itemKey,itemKey))).returning({id:aiToolConfigsTable.id});
  return Boolean(row);
}
export async function removeMany(type: AiToolType, itemKeys: string[]) {
  if (itemKeys.length === 0) return 0;
  const rows = await db.delete(aiToolConfigsTable)
    .where(and(eq(aiToolConfigsTable.type, type), inArray(aiToolConfigsTable.itemKey, itemKeys)))
    .returning({ id: aiToolConfigsTable.id });
  return rows.length;
}
