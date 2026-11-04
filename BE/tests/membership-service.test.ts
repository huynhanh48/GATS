import { beforeEach, describe, expect, it, vi } from 'vitest';

const membershipRepo = vi.hoisted(() => ({
  listPlans: vi.fn(),
  countActiveByPlans: vi.fn(),
  findPlanById: vi.fn(),
  findPlanByCode: vi.fn(),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  listMemberships: vi.fn(),
  revokeActiveForUser: vi.fn(),
  createMembership: vi.fn(),
  findMembershipById: vi.fn(),
  updateMembership: vi.fn(),
}));
const userRepo = vi.hoisted(() => ({ findById: vi.fn() }));
const auditRepo = vi.hoisted(() => ({ record: vi.fn() }));

vi.mock('@src/repos/MembershipRepo', () => membershipRepo);
vi.mock('@src/repos/UserRepo', () => userRepo);
vi.mock('@src/repos/AuditLogRepo', () => auditRepo);

import MembershipService from '@src/services/MembershipService';

describe('MembershipService', () => {
  const planId = '11111111-1111-4111-8111-111111111111';
  const membershipId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.findById.mockResolvedValue({ id: 12, userName: 'member' });
    membershipRepo.findPlanById.mockResolvedValue({
      id: planId,
      code: 'PLUS',
      monthlyPrice: 199000,
      yearlyPrice: 1790000,
      monthlyDurationDays: 30,
      yearlyDurationDays: 365,
    });
    membershipRepo.revokeActiveForUser.mockResolvedValue([]);
    membershipRepo.createMembership.mockImplementation((data) => ({
      id: membershipId,
      ...data,
    }));
  });

  it('grants membership with plan duration and revokes an old active membership', async () => {
    const startsAt = new Date('2026-08-12T00:00:00.000Z');
    const result = await MembershipService.grant(
      {
        userId: 12,
        planId,
        billingInterval: 'monthly',
        startsAt,
        source: 'admin_granted',
        reason: 'Đối tác dùng thử',
      },
      1,
    );

    expect(membershipRepo.revokeActiveForUser).toHaveBeenCalledWith(
      12,
      1,
      expect.stringContaining('Đối tác dùng thử'),
    );
    expect(membershipRepo.createMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 12,
        planId,
        billingInterval: 'monthly',
        currentPeriodStart: startsAt,
        currentPeriodEnd: new Date('2026-09-11T00:00:00.000Z'),
        priceSnapshot: 0,
      }),
    );
    expect(result.data.id).toBe(membershipId);
    expect(auditRepo.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'membership.granted' }),
    );
  });

  it('rejects an end date before the start date', async () => {
    await expect(
      MembershipService.grant(
        {
          userId: 12,
          planId,
          billingInterval: 'monthly',
          startsAt: new Date('2026-08-12T00:00:00.000Z'),
          endsAt: new Date('2026-08-11T00:00:00.000Z'),
          source: 'admin_granted',
          reason: 'Khoảng thời gian sai',
        },
        1,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('extends from the current future end date', async () => {
    membershipRepo.findMembershipById.mockResolvedValue({
      id: membershipId,
      userId: 12,
      currentPeriodEnd: new Date('2099-01-01T00:00:00.000Z'),
    });
    membershipRepo.updateMembership.mockImplementation((_id, data) => data);

    await MembershipService.extend(membershipId, 30, 'Gia hạn chăm sóc', 1);

    expect(membershipRepo.updateMembership).toHaveBeenCalledWith(
      membershipId,
      expect.objectContaining({
        status: 'active',
        currentPeriodEnd: new Date('2099-01-31T00:00:00.000Z'),
      }),
    );
  });

  it('revokes membership without deleting history', async () => {
    membershipRepo.findMembershipById.mockResolvedValue({
      id: membershipId,
      userId: 12,
    });
    membershipRepo.updateMembership.mockImplementation((_id, data) => data);

    await MembershipService.revoke(membershipId, 'Vi phạm điều khoản', 1);

    expect(membershipRepo.updateMembership).toHaveBeenCalledWith(
      membershipId,
      expect.objectContaining({
        status: 'revoked',
        revokedBy: 1,
        revokeReason: 'Vi phạm điều khoản',
      }),
    );
  });
});
