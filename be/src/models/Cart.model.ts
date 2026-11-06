import { z } from 'zod';

export const addToCartSchema = z.object({
  courseId: z.string().uuid(),
  quantity: z.number().int().positive().max(1).default(1),
});

export const changeCartItemQuantitySchema = z.object({
  quantity: z.number().int().positive().max(1),
});

export const cartCourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string().nullable(),
  price: z.number().int().min(0),
  salePrice: z.number().int().min(0).nullable(),
  status: z.string(),
});

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  courseId: z.string().uuid(),
  quantity: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  course: cartCourseSchema,
  finalPrice: z.number().int().min(0),
  lineTotal: z.number().int().min(0),
});

export const cartSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(cartItemSchema),
  totalAmount: z.number().int().min(0),
  itemCount: z.number().int().min(0),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type ChangeCartItemQuantityInput = z.infer<
  typeof changeCartItemQuantitySchema
>;
export type CartCourse = z.infer<typeof cartCourseSchema>;
export type CartItemView = z.infer<typeof cartItemSchema>;
export type CartView = z.infer<typeof cartSchema>;

export function parseAddToCartInput(data: unknown): AddToCartInput {
  return addToCartSchema.parse(data);
}

export function parseChangeCartItemQuantityInput(
  data: unknown,
): ChangeCartItemQuantityInput {
  return changeCartItemQuantitySchema.parse(data);
}
