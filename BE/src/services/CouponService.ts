import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { normalizeCouponCode } from '@src/models/Coupon.model';
import type { CreateCouponInput, UpdateCouponInput } from '@src/models/Coupon.model';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as CouponRepo from '@src/repos/CouponRepo';
import type { Coupon } from '@src/db/schema/coupon';

const Errors = {
  NOT_FOUND: 'Coupon not found',
  CODE_TAKEN: 'Coupon code already exists',
  INVALID_CODE: 'Coupon code is invalid or inactive',
  EXPIRED: 'Coupon has expired or is not yet active',
  LIMIT_REACHED: 'Coupon usage limit reached',
  MIN_AMOUNT: 'Order amount does not meet the coupon minimum',
  WRONG_SCOPE: 'Coupon is not valid for this product',
} as const;

function computeDiscount(coupon: Coupon, orderAmount: number): number {
  const raw =
    coupon.type === 'percent'
      ? Math.round((orderAmount * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(raw, orderAmount));
}

async function create(input: CreateCouponInput, actorUserId?: number) {
  const existing = await CouponRepo.findByCode(input.code);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.CODE_TAKEN);
  }

  const coupon = await CouponRepo.create({
    code: input.code,
    description: input.description || null,
    type: input.type,
    scope: input.scope,
    membershipPlanId: input.scope === 'membership' ? input.membershipPlanId ?? null : null,
    value: input.value,
    maxUses: input.maxUses ?? null,
    minOrderAmount: input.minOrderAmount,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    isActive: input.isActive,
    createdById: actorUserId ?? null,
  });

  await AuditLogRepo.record({
    actorUserId,
    action: 'coupon.created',
    resourceType: 'coupon',
    resourceId: coupon.id,
    meta: { code: coupon.code },
  });

  return { data: coupon };
}

async function list(query: {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const { data, total } = await CouponRepo.list({
    skip,
    take: limit,
    q: query.q,
    isActive: query.isActive,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
  };
}

async function getById(id: string) {
  const coupon = await CouponRepo.findById(id);
  if (!coupon) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { data: coupon };
}

async function update(
  id: string,
  input: UpdateCouponInput,
  actorUserId?: number,
) {
  const coupon = await CouponRepo.findById(id);
  if (!coupon) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const updated = await CouponRepo.update(id, {
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.membershipPlanId !== undefined
      ? { membershipPlanId: input.membershipPlanId }
      : {}),
    ...(input.value !== undefined ? { value: input.value } : {}),
    ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
    ...(input.minOrderAmount !== undefined
      ? { minOrderAmount: input.minOrderAmount }
      : {}),
    ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
    ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });

  await AuditLogRepo.record({
    actorUserId,
    action: 'coupon.updated',
    resourceType: 'coupon',
    resourceId: id,
    meta: input,
  });

  return { data: updated };
}

async function remove(id: string, actorUserId?: number) {
  const coupon = await CouponRepo.findById(id);
  if (!coupon) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  await CouponRepo.remove(id);
  await AuditLogRepo.record({
    actorUserId,
    action: 'coupon.deleted',
    resourceType: 'coupon',
    resourceId: id,
    meta: { code: coupon.code },
  });
  return { message: 'Đã xóa mã giảm giá' };
}

/** Validates a coupon for a given order amount without redeeming it. */
async function validate(
  code: string,
  orderAmount: number,
  context: { scope: 'course' | 'membership'; membershipPlanId?: string } = {
    scope: 'course',
  },
): Promise<{ coupon: Coupon; discountAmount: number }> {
  const coupon = await CouponRepo.findByCode(normalizeCouponCode(code));
  if (!coupon || !coupon.isActive) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_CODE);
  }

  const now = new Date();
  if (
    (coupon.startsAt && now < coupon.startsAt) ||
    (coupon.endsAt && now > coupon.endsAt)
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.EXPIRED);
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.LIMIT_REACHED);
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.MIN_AMOUNT);
  }

  if (coupon.scope !== 'all' && coupon.scope !== context.scope) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.WRONG_SCOPE);
  }
  if (
    coupon.scope === 'membership' &&
    coupon.membershipPlanId &&
    coupon.membershipPlanId !== context.membershipPlanId
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.WRONG_SCOPE);
  }

  const discountAmount = computeDiscount(coupon, orderAmount);
  return { coupon, discountAmount };
}

/** Public endpoint for checkout preview — validate without redeeming. */
async function preview(
  code: string,
  orderAmount: number,
  context?: { scope: 'course' | 'membership'; membershipPlanId?: string },
) {
  const { coupon, discountAmount } = await validate(code, orderAmount, context);
  return {
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    },
  };
}

/**
 * Records the actual usage of a coupon on a created order — increments usage
 * count and writes the redemption row. Call only after `validate()` has
 * already priced the order (e.g. in OrderService.createOrder).
 */
async function commitRedemption(
  couponId: string,
  discountAmount: number,
  orderId: string,
  userId: number,
): Promise<void> {
  await CouponRepo.incrementUsage(couponId);
  await CouponRepo.createRedemption({
    couponId,
    orderId,
    userId,
    discountAmount,
  });
}

export default {
  Errors,
  create,
  list,
  getById,
  update,
  remove,
  validate,
  preview,
  commitRedemption,
};
