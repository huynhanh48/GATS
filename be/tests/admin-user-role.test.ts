import { beforeEach, describe, expect, it, vi } from 'vitest';

const userRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  getRoleNames: vi.fn(),
  clearSession: vi.fn(),
  toPublicUser: vi.fn(),
  createVerifyToken: vi.fn(),
  listAdmin: vi.fn(),
  update: vi.fn(),
}));
const roleRepo = vi.hoisted(() => ({
  getGlobalRoleNames: vi.fn(),
  countUsersWithGlobalRole: vi.fn(),
  replaceGlobalRole: vi.fn(),
  findByName: vi.fn(),
  assignRoleToUser: vi.fn(),
  removeScopedRoleFromUser: vi.fn(),
}));
const courseRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  listByInstructorId: vi.fn(),
}));
const auditRepo = vi.hoisted(() => ({
  record: vi.fn(),
  listByResource: vi.fn(),
}));

vi.mock('@src/repos/UserRepo', () => userRepo);
vi.mock('@src/repos/RoleRepo', () => roleRepo);
vi.mock('@src/repos/AuditLogRepo', () => auditRepo);
vi.mock('@src/repos/CourseRepo', () => courseRepo);

import AdminUserService from '@src/services/AdminUserService';

describe('AdminUserService.updateGlobalRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.findById.mockResolvedValue({ id: 9, userName: 'member' });
    userRepo.getRoleNames.mockResolvedValue(['user']);
    userRepo.toPublicUser.mockImplementation((user, roles) => ({
      id: user.id,
      roles,
    }));
    roleRepo.getGlobalRoleNames.mockResolvedValue(['user']);
    roleRepo.countUsersWithGlobalRole.mockResolvedValue(2);
  });

  it('prevents an admin from demoting their own account', async () => {
    roleRepo.getGlobalRoleNames.mockResolvedValue(['admin']);

    await expect(
      AdminUserService.updateGlobalRole(9, 'user', 9),
    ).rejects.toMatchObject({ status: 409 });
    expect(roleRepo.replaceGlobalRole).not.toHaveBeenCalled();
  });

  it('prevents demoting the final global admin', async () => {
    roleRepo.getGlobalRoleNames.mockResolvedValue(['admin']);
    roleRepo.countUsersWithGlobalRole.mockResolvedValue(1);

    await expect(
      AdminUserService.updateGlobalRole(9, 'user', 1),
    ).rejects.toMatchObject({ status: 409 });
    expect(roleRepo.replaceGlobalRole).not.toHaveBeenCalled();
  });

  it('updates the global role, revokes sessions and writes an audit log', async () => {
    await expect(
      AdminUserService.updateGlobalRole(9, 'admin', 1),
    ).resolves.toMatchObject({
      globalRoles: ['admin'],
    });
    expect(roleRepo.replaceGlobalRole).toHaveBeenCalledWith(9, 'admin');
    expect(userRepo.clearSession).toHaveBeenCalledWith(9);
    expect(auditRepo.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 1,
        action: 'user.role_updated',
        resourceId: '9',
      }),
    );
  });
});

describe('AdminUserService.assignMentorCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.findById.mockResolvedValue({ id: 9, userName: 'mentor' });
    courseRepo.findById.mockResolvedValue({
      id: '6e7d7eb3-f0e1-43b6-93e9-68a2c80206bd',
      title: 'AI Foundation',
      instructorId: 7,
    });
    roleRepo.findByName.mockResolvedValue({ id: 3, name: 'instructor' });
  });

  it('replaces the previous mentor and assigns course-scoped permission', async () => {
    const courseId = '6e7d7eb3-f0e1-43b6-93e9-68a2c80206bd';

    await expect(
      AdminUserService.assignMentorCourse(9, courseId, 1),
    ).resolves.toMatchObject({ message: expect.stringContaining('mentor') });
    expect(roleRepo.removeScopedRoleFromUser).toHaveBeenCalledWith(
      7,
      3,
      'course',
      courseId,
    );
    expect(courseRepo.update).toHaveBeenCalledWith(courseId, {
      instructorId: 9,
    });
    expect(roleRepo.assignRoleToUser).toHaveBeenCalledWith(9, 3, {
      resourceType: 'course',
      resourceId: courseId,
    });
    expect(userRepo.clearSession).toHaveBeenCalledWith(9);
    expect(userRepo.clearSession).toHaveBeenCalledWith(7);
  });
});
