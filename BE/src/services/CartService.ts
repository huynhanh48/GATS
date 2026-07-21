import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  AddToCartInput,
  CartView,
  ChangeCartItemQuantityInput,
} from '@src/models/Cart.model';
import * as CartRepo from '@src/repos/CartRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';

const Errors = {
  COURSE_NOT_FOUND: 'Course not found',
  NOT_PUBLISHED: 'Course is not published',
  NOT_PAID_COURSE: 'Only paid courses can be added to cart',
  ALREADY_ENROLLED: 'Already enrolled in this course',
  CART_ITEM_NOT_FOUND: 'Cart item not found',
  FORBIDDEN: 'Forbidden',
} as const;

function finalPrice(price: number, salePrice: number | null): number {
  // Only apply sale when it is a real discount (strictly below list price).
  if (salePrice !== null && salePrice > 0 && salePrice < price) {
    return salePrice;
  }
  return price;
}

async function buildCartView(userId: number): Promise<CartView> {
  const cart = await CartRepo.findOrCreateCart(userId);
  const items = await CartRepo.listItemsByCartId(cart.id);

  const views = [];
  for (const item of items) {
    const course = await CourseRepo.findById(item.courseId);
    if (!course) continue;
    const unit = finalPrice(course.price, course.salePrice);
    views.push({
      id: item.id,
      cartId: item.cartId,
      courseId: item.courseId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        price: course.price,
        salePrice: course.salePrice,
        status: course.status,
      },
      finalPrice: unit,
      lineTotal: unit * item.quantity,
    });
  }

  const totalAmount = views.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: views,
    totalAmount,
    itemCount: views.length,
  };
}

async function addItem(userId: number, input: AddToCartInput) {
  const course = await CourseRepo.findById(input.courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }
  if (course.status !== 'published') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PUBLISHED);
  }

  const unit = finalPrice(course.price, course.salePrice);
  if (unit <= 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PAID_COURSE);
  }

  const enrolled = await EnrollmentRepo.findActive(userId, input.courseId);
  if (enrolled) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ENROLLED);
  }

  const cart = await CartRepo.findOrCreateCart(userId);
  const existing = await CartRepo.findItemByCartAndCourse(
    cart.id,
    input.courseId,
  );

  if (existing) {
    // Courses are digital — keep quantity at 1
    await CartRepo.touchCart(cart.id);
    return buildCartView(userId);
  }

  await CartRepo.addItem({
    cartId: cart.id,
    courseId: input.courseId,
    quantity: 1,
  });
  await CartRepo.touchCart(cart.id);
  return buildCartView(userId);
}

async function getCart(userId: number) {
  return buildCartView(userId);
}

async function changeQuantity(
  userId: number,
  itemId: string,
  input: ChangeCartItemQuantityInput,
) {
  const item = await CartRepo.findItemById(itemId);
  if (!item) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.CART_ITEM_NOT_FOUND,
    );
  }

  const cart = await CartRepo.findCartByUserId(userId);
  if (!cart || cart.id !== item.cartId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  await CartRepo.updateItemQuantity(itemId, input.quantity);
  await CartRepo.touchCart(cart.id);
  return buildCartView(userId);
}

async function removeItem(userId: number, itemId: string) {
  const item = await CartRepo.findItemById(itemId);
  if (!item) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.CART_ITEM_NOT_FOUND,
    );
  }

  const cart = await CartRepo.findCartByUserId(userId);
  if (!cart || cart.id !== item.cartId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  await CartRepo.removeItem(itemId);
  await CartRepo.touchCart(cart.id);
  return buildCartView(userId);
}

async function clearCart(userId: number) {
  const cart = await CartRepo.findOrCreateCart(userId);
  await CartRepo.clearCartItems(cart.id);
  await CartRepo.touchCart(cart.id);
  return buildCartView(userId);
}

export default {
  Errors,
  addItem,
  getCart,
  changeQuantity,
  removeItem,
  clearCart,
  buildCartView,
  finalPrice,
};
