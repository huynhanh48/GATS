import { Router } from 'express';

import AdminUserPaths from '@src/common/paths/admin-user';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import handlers from './adminUserRouter';

const apiRouter = Router();
const router = Router();

router.get(
  AdminUserPaths.AdminUsers.List,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.listUsers,
);

router.get(
  AdminUserPaths.AdminUsers.Get,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.getUser,
);

router.post(
  AdminUserPaths.AdminUsers.ResendVerification,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.resendVerification,
);

router.post(
  AdminUserPaths.AdminUsers.SendPasswordReset,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.sendPasswordReset,
);

router.post(
  AdminUserPaths.AdminUsers.RevokeSessions,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.revokeSessions,
);

router.patch(
  AdminUserPaths.AdminUsers.Lock,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.lockUser,
);

router.patch(
  AdminUserPaths.AdminUsers.Unlock,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.unlockUser,
);

router.patch(
  AdminUserPaths.AdminUsers.Role,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.updateRole,
);

router.patch(
  AdminUserPaths.AdminUsers.MentorCourse,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.assignMentorCourse,
);

apiRouter.use(AdminUserPaths.AdminUsers._, router);
export default apiRouter;
