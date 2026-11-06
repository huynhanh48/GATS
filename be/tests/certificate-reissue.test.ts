/**
 * Certificate admin issue / reissue contracts.
 * Mocks repos so vitest does not need a live DB.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  findByUserAndCourse,
  findById,
  create,
  reissue,
  findActive,
  findCourseById,
  auditRecord,
} = vi.hoisted(() => ({
  findByUserAndCourse: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  reissue: vi.fn(),
  findActive: vi.fn(),
  findCourseById: vi.fn(),
  auditRecord: vi.fn(),
}));

vi.mock('@src/repos/CertificateRepo', () => ({
  findByUserAndCourse,
  findById,
  create,
  reissue,
  revoke: vi.fn(),
  listByUser: vi.fn(),
  findByNumber: vi.fn(),
  listAdmin: vi.fn(),
}));

vi.mock('@src/repos/CourseRepo', () => ({
  findById: findCourseById,
}));

vi.mock('@src/repos/EnrollmentRepo', () => ({
  findActive,
}));

vi.mock('@src/repos/AuditLogRepo', () => ({
  record: auditRecord,
}));

vi.mock('@src/repos/UserRepo', () => ({
  findById: vi.fn(),
}));

import CertificateService from '@src/services/CertificateService';
import { RouteError } from '@src/common/utils/route-errors';

const USER_ID = 12;
const COURSE_ID = '11111111-1111-1111-1111-111111111111';
const ACTOR_ID = 1;

function revokedCert(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cert-1',
    certificateNumber: 'GATS-2026-AAAAAAAA',
    userId: USER_ID,
    courseId: COURSE_ID,
    status: 'revoked' as const,
    issuedById: null,
    issuedAt: new Date('2026-01-01'),
    revokedAt: new Date('2026-02-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
    ...overrides,
  };
}

function issuedCert(overrides: Record<string, unknown> = {}) {
  return {
    ...revokedCert({ status: 'issued', revokedAt: null, ...overrides }),
  };
}

describe('CertificateService.adminIssue / reissue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findCourseById.mockResolvedValue({ id: COURSE_ID, title: 'Test' });
    findActive.mockResolvedValue({ id: 'enr-1' });
    auditRecord.mockResolvedValue(undefined);
  });

  it('creates a new certificate when none exists', async () => {
    findByUserAndCourse.mockResolvedValue(undefined);
    const created = issuedCert({ certificateNumber: 'GATS-2026-NEWNEWNE' });
    create.mockResolvedValue(created);

    const result = await CertificateService.adminIssue(
      USER_ID,
      COURSE_ID,
      ACTOR_ID,
    );

    expect(result.reissued).toBe(false);
    expect(create).toHaveBeenCalled();
    expect(reissue).not.toHaveBeenCalled();
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'certificate.issued' }),
    );
  });

  it('conflicts when certificate already issued', async () => {
    findByUserAndCourse.mockResolvedValue(issuedCert());

    await expect(
      CertificateService.adminIssue(USER_ID, COURSE_ID, ACTOR_ID),
    ).rejects.toBeInstanceOf(RouteError);

    await expect(
      CertificateService.adminIssue(USER_ID, COURSE_ID, ACTOR_ID),
    ).rejects.toMatchObject({
      message: CertificateService.Errors.ALREADY_ISSUED,
    });
    expect(create).not.toHaveBeenCalled();
    expect(reissue).not.toHaveBeenCalled();
  });

  it('reissues when existing certificate is revoked (via adminIssue)', async () => {
    const existing = revokedCert();
    findByUserAndCourse.mockResolvedValue(existing);
    const updated = issuedCert({
      certificateNumber: 'GATS-2026-BBBBBBBB',
      issuedById: ACTOR_ID,
    });
    reissue.mockResolvedValue(updated);

    const result = await CertificateService.adminIssue(
      USER_ID,
      COURSE_ID,
      ACTOR_ID,
      'Sửa tên',
    );

    expect(result.reissued).toBe(true);
    expect(result.data.certificateNumber).toBe('GATS-2026-BBBBBBBB');
    expect(create).not.toHaveBeenCalled();
    expect(reissue).toHaveBeenCalledWith(
      existing.id,
      expect.objectContaining({ issuedById: ACTOR_ID }),
    );
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'certificate.reissued',
        meta: expect.objectContaining({
          previousCertificateNumber: 'GATS-2026-AAAAAAAA',
          reason: 'Sửa tên',
        }),
      }),
    );
  });

  it('adminReissue by id requires revoked status', async () => {
    findById.mockResolvedValue(issuedCert());

    await expect(
      CertificateService.adminReissue('cert-1', ACTOR_ID),
    ).rejects.toMatchObject({
      message: CertificateService.Errors.NOT_REVOKED,
    });
  });

  it('adminReissue updates revoked row with new number', async () => {
    const existing = revokedCert();
    findById.mockResolvedValue(existing);
    reissue.mockResolvedValue(
      issuedCert({ certificateNumber: 'GATS-2026-CCCCCCCC' }),
    );

    const result = await CertificateService.adminReissue(
      existing.id,
      ACTOR_ID,
      null,
    );

    expect(result.reissued).toBe(true);
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'certificate.reissued',
        meta: expect.objectContaining({
          previousCertificateNumber: 'GATS-2026-AAAAAAAA',
        }),
      }),
    );
  });

  it('issueIfEligible does not auto-reissue revoked certificates', async () => {
    const existing = revokedCert();
    findByUserAndCourse.mockResolvedValue(existing);

    const result = await CertificateService.issueIfEligible(
      USER_ID,
      COURSE_ID,
    );

    expect(result).toEqual(existing);
    expect(create).not.toHaveBeenCalled();
    expect(reissue).not.toHaveBeenCalled();
  });
});
