import {
  paymentMethodEnum,
  orderStatusEnum,
} from '@src/db/schema/order';
import { paymentExceptionTypeEnum } from '@src/db/schema/payment-exception';
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
  couponCode: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .optional()
    .or(z.literal('')),
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
  couponId: z.string().uuid().nullable().optional(),
  couponCode: z.string().nullable().optional(),
  discountAmount: z.number().int().min(0).default(0),
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

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: orderStatusSchema.optional(),
  q: z.string().trim().max(200).optional(),
  expiredPending: z
    .union([z.literal('1'), z.literal('true'), z.literal('yes'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === '1' || v === 'true' || v === 'yes'),
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.enum(['paid', 'cancelled', 'refunded']),
  reason: z.string().trim().min(3).max(500).optional(),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type AdminUpdateOrderStatusInput = z.infer<
  typeof adminUpdateOrderStatusSchema
>;

export function parseAdminOrderListQuery(data: unknown): AdminOrderListQuery {
  return adminOrderListQuerySchema.parse(data);
}

export function parseAdminUpdateOrderStatus(
  data: unknown,
): AdminUpdateOrderStatusInput {
  return adminUpdateOrderStatusSchema.parse(data);
}

export const paymentExceptionTypeSchema = z.enum(
  paymentExceptionTypeEnum.enumValues,
);

export const adminExceptionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: paymentExceptionTypeSchema.optional(),
  resolved: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
});

export const adminExportOrdersQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  q: z.string().trim().max(200).optional(),
});

export const adminResolveExceptionSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

export type AdminExceptionListQuery = z.infer<
  typeof adminExceptionListQuerySchema
>;
export type AdminExportOrdersQuery = z.infer<
  typeof adminExportOrdersQuerySchema
>;
export type AdminResolveExceptionInput = z.infer<
  typeof adminResolveExceptionSchema
>;

export function parseAdminExceptionListQuery(
  data: unknown,
): AdminExceptionListQuery {
  return adminExceptionListQuerySchema.parse(data);
}

export function parseAdminExportOrdersQuery(
  data: unknown,
): AdminExportOrdersQuery {
  return adminExportOrdersQuerySchema.parse(data);
}

export function parseAdminResolveException(
  data: unknown,
): AdminResolveExceptionInput {
  return adminResolveExceptionSchema.parse(data);
}
