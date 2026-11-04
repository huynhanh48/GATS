import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateMembershipPlanInput,
  GrantMembershipInput,
  MembershipListQuery,
  UpdateMembershipPlanInput,
} from '@src/models/Membership.model';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as MembershipRepo from '@src/repos/MembershipRepo';
import * as UserRepo from '@src/repos/UserRepo';

const Errors = {
  PLAN_NOT_FOUND: 'Membership plan not found',
  PLAN_CODE_TAKEN: 'Membership plan code already exists',
  MEMBERSHIP_NOT_FOUND: 'Membership not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_PERIOD: 'Membership end date must be after start date',
} as const;

async function listPlans() {
  const [plans, activeCounts] = await Promise.all([
    MembershipRepo.listPlans(),
    MembershipRepo.countActiveByPlans(),
  ]);
  return {
    data: plans.map((plan) => ({
      ...plan,
      activeMembers: activeCounts.get(plan.id) ?? 0,
    })),
  };
}

async function createPlan(input: CreateMembershipPlanInput, actorUserId: number) {
  if (await MembershipRepo.findPlanByCode(input.code)) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.PLAN_CODE_TAKEN);
  }
  const plan = await MembershipRepo.createPlan(input);
  await AuditLogRepo.record({
    actorUserId,
    action: 'membership.plan_created',
    resourceType: 'membership_plan',
    resourceId: plan.id,
    meta: {
      code: plan.code,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
    },
  });
  return { data: plan };
}

async function updatePlan(
  id: string,
  input: UpdateMembershipPlanInput,
  actorUserId: number,
) {
  const previous = await MembershipRepo.findPlanById(id);
  if (!previous) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.PLAN_NOT_FOUND);
  }
  const updated = await MembershipRepo.updatePlan(id, input);
  await AuditLogRepo.record({
    actorUserId,
    action: 'membership.plan_updated',
    resourceType: 'membership_plan',
    resourceId: id,
    meta: { before: previous, changes: input },
  });
  return { data: updated };
}

async function listMemberships(query: MembershipListQuery) {
  const skip = (query.page - 1) * query.limit;
  const result = await MembershipRepo.listMemberships({
    skip,
    take: query.limit,
    q: query.q,
    status: query.status,
    planId: query.planId,
  });
  return {
    data: result.data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
      hasMore: query.page * query.limit < result.total,
    },
  };
}

function calculateEndDate(start: Date, durationDays: number | null) {
  if (!durationDays) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + durationDays);
  return end;
}

async function grant(
  input: GrantMembershipInput,
  actorUserId: number,
) {
  const [user, plan] = await Promise.all([
    UserRepo.findById(input.userId),
    MembershipRepo.findPlanById(input.planId),
  ]);
  if (!user) throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  if (!plan) throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.PLAN_NOT_FOUND);

  const startsAt = input.startsAt ?? new Date();
  const durationDays =
    input.billingInterval === 'monthly'
      ? plan.monthlyDurationDays
      : input.billingInterval === 'yearly'
        ? plan.yearlyDurationDays
        : null;
  const selectedPrice =
    input.billingInterval === 'monthly'
      ? plan.monthlyPrice
      : input.billingInterval === 'yearly'
        ? plan.yearlyPrice
        : 0;
  if (input.billingInterval !== 'lifetime' && selectedPrice === null) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Plan does not support this billing interval');
  }
  const endsAt =
    input.endsAt === undefined
      ? calculateEndDate(startsAt, durationDays)
      : input.endsAt;
  if (endsAt && endsAt <= startsAt) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_PERIOD);
  }

  await MembershipRepo.revokeActiveForUser(
    input.userId,
    actorUserId,
    `Replaced by admin grant: ${input.reason}`,
  );
  const membership = await MembershipRepo.createMembership({
    userId: input.userId,
    planId: input.planId,
    billingInterval: input.billingInterval,
    status: 'active',
    source: input.source,
    startedAt: startsAt,
    currentPeriodStart: startsAt,
    currentPeriodEnd: endsAt,
    priceSnapshot: 0,
    grantedBy: actorUserId,
    grantReason: input.reason,
  });
  await AuditLogRepo.record({
    actorUserId,
    action: 'membership.granted',
    resourceType: 'membership',
    resourceId: membership.id,
    meta: {
      userId: input.userId,
      planId: input.planId,
      billingInterval: input.billingInterval,
      endsAt,
      reason: input.reason,
    },
  });
  return { data: membership };
}

async function extend(id: string, days: number, reason: string, actorUserId: number) {
  const current = await MembershipRepo.findMembershipById(id);
  if (!current) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.MEMBERSHIP_NOT_FOUND);
  }
  const base =
    current.currentPeriodEnd && current.currentPeriodEnd > new Date()
      ? current.currentPeriodEnd
      : new Date();
  const end = new Date(base);
  end.setUTCDate(end.getUTCDate() + days);
  const updated = await MembershipRepo.updateMembership(id, {
    status: 'active',
    currentPeriodEnd: end,
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
  });
  await AuditLogRepo.record({
    actorUserId,
    action: 'membership.extended',
    resourceType: 'membership',
    resourceId: id,
    meta: { days, previousEnd: current.currentPeriodEnd, newEnd: end, reason },
  });
  return { data: updated };
}

async function revoke(id: string, reason: string, actorUserId: number) {
  const current = await MembershipRepo.findMembershipById(id);
  if (!current) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.MEMBERSHIP_NOT_FOUND);
  }
  const updated = await MembershipRepo.updateMembership(id, {
    status: 'revoked',
    revokedBy: actorUserId,
    revokedAt: new Date(),
    revokeReason: reason,
  });
  await AuditLogRepo.record({
    actorUserId,
    action: 'membership.revoked',
    resourceType: 'membership',
    resourceId: id,
    meta: { userId: current.userId, reason },
  });
  return { data: updated };
}

async function activatePurchase(input: {
  userId: number;
  planId: string;
  billingInterval: 'monthly' | 'yearly';
  priceSnapshot: number;
  orderId: string;
}) {
  const plan = await MembershipRepo.findPlanById(input.planId);
  if (!plan) throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.PLAN_NOT_FOUND);
  const durationDays = input.billingInterval === 'monthly'
    ? plan.monthlyDurationDays
    : plan.yearlyDurationDays;
  const start = new Date();
  const end = calculateEndDate(start, durationDays);
  await MembershipRepo.revokeActiveForUser(
    input.userId,
    input.userId,
    `Replaced by paid order ${input.orderId}`,
  );
  const membership = await MembershipRepo.createMembership({
    userId: input.userId,
    planId: input.planId,
    billingInterval: input.billingInterval,
    status: 'active',
    source: 'purchase',
    startedAt: start,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    priceSnapshot: input.priceSnapshot,
    grantReason: `Paid order ${input.orderId}`,
  });
  await AuditLogRepo.record({
    actorUserId: input.userId,
    action: 'membership.purchased',
    resourceType: 'membership',
    resourceId: membership.id,
    meta: input,
  });
  return membership;
}

export default {
  Errors,
  listPlans,
  createPlan,
  updatePlan,
  listMemberships,
  grant,
  extend,
  revoke,
  activatePurchase,
};
