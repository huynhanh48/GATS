import {
  paymentMethodEnum,
  orderStatusEnum,
} from '@src/db/schema/order';
import { z } from 'zod';

export const paymentMethodSchema = z.enum(paymentMethodEnum.enumValues);
export const orderStatusSchema = z.enum(orderStatusEnum.enumValues);

export const createOrderItemSchema = z.object({
  courseId: z.string().uuid(),
  quantity: z.number().int().positive().max(1).default(1),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1).optional(),
  /** When true (default), checkout uses current cart items if `items` omitted */
  fromCart: z.boolean().default(true),
  paymentMethod: paymentMethodSchema,
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().max(255).optional(),
  customerPhone: z.string().min(1).max(20).optional(),
  notes: z.string().max(2000).optional(),
});

export const orderItemRecordSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  courseId: z.string().uuid(),
  courseName: z.string(),
  price: z.number().int().min(0),
  quantity: z.number().int().positive(),
  createdAt: z.coerce.date(),
});

export const orderRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int().positive(),
  totalAmount: z.number().int().min(0),
  status: orderStatusSchema,
  paymentMethod: paymentMethodSchema.nullable(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  customerPhone: z.string().nullable(),
  notes: z.string().nullable(),
  paidAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orderDetailSchema = orderRecordSchema.extend({
  items: z.array(orderItemRecordSchema),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type OrderRecord = z.infer<typeof orderRecordSchema>;
export type OrderItemRecord = z.infer<typeof orderItemRecordSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;

export function parseCreateOrderInput(data: unknown): CreateOrderInput {
  return createOrderSchema.parse(data);
}

export function parseOrderRecord(data: unknown): OrderRecord {
  return orderRecordSchema.parse(data);
}

export function parseOrderItemRecord(data: unknown): OrderItemRecord {
  return orderItemRecordSchema.parse(data);
}
