import AuthPaths from '@src/common/paths/auth';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  handleMediaUploadError,
  thumbnailUploadMiddleware,
} from '@src/middleware/mediaUploadMiddleware';
import { simpleRateLimit } from '@src/middleware/simpleRateLimit';
import { Router } from 'express';
import authHandlers from './authRouter';

const apiRouter = Router();
const authRouter = Router();

const forgotPasswordLimit = simpleRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
});

authRouter.post(AuthPaths.User.Register, authHandlers.register);
authRouter.post(AuthPaths.User.Login, authHandlers.login);
authRouter.post(AuthPaths.User.GoogleLogin, authHandlers.googleLogin);
authRouter.post(AuthPaths.User.AppleLogin, authHandlers.appleLogin);
authRouter.post(AuthPaths.User.Refresh, authHandlers.refresh);
authRouter.post(AuthPaths.User.VerifyEmail, authHandlers.verifyEmail);
authRouter.get(AuthPaths.User.VerifyEmail, authHandlers.verifyEmailByLink);
authRouter.post(
  AuthPaths.User.ForgotPassword,
  forgotPasswordLimit,
  authHandlers.forgotPassword,
);
authRouter.post(AuthPaths.User.ResetPassword, authHandlers.resetPassword);
authRouter.post(
  AuthPaths.User.Logout,
  errorHandle(authMiddleware),
  authHandlers.logout,
);
authRouter.get(AuthPaths.User.Me, errorHandle(authMiddleware), authHandlers.me);
authRouter.put(AuthPaths.User.Me, errorHandle(authMiddleware), authHandlers.updateMe);
authRouter.post(
  AuthPaths.User.Avatar,
  errorHandle(authMiddleware),
  (req, res, next) => {
    thumbnailUploadMiddleware(req, res, (err) => {
      if (err) {
        handleMediaUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  authHandlers.uploadAvatar,
);
authRouter.post(
  AuthPaths.User.Cover,
  errorHandle(authMiddleware),
  (req, res, next) => {
    thumbnailUploadMiddleware(req, res, (err) => {
      if (err) {
        handleMediaUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  authHandlers.uploadCover,
);
authRouter.post(
  AuthPaths.User.ChangePassword,
  errorHandle(authMiddleware),
  authHandlers.changePassword,
);
authRouter.get(
  AuthPaths.User.Sessions,
  errorHandle(authMiddleware),
  authHandlers.listSessions,
);
authRouter.delete(
  AuthPaths.User.SessionsOthers,
  errorHandle(authMiddleware),
  authHandlers.revokeOtherSessions,
);
authRouter.delete(
  AuthPaths.User.SessionById,
  errorHandle(authMiddleware),
  authHandlers.revokeSession,
);
authRouter.post(
  AuthPaths.User.Devices,
  errorHandle(authMiddleware),
  authHandlers.registerDevice,
);
authRouter.patch(
  AuthPaths.User.DeviceById,
  errorHandle(authMiddleware),
  authHandlers.updateDevice,
);
authRouter.delete(
  AuthPaths.User.DeviceById,
  errorHandle(authMiddleware),
  authHandlers.removeDevice,
);
authRouter.get(
  AuthPaths.User.NotificationPreferences,
  errorHandle(authMiddleware),
  authHandlers.getNotificationPreferences,
);
authRouter.put(
  AuthPaths.User.NotificationPreferences,
  errorHandle(authMiddleware),
  authHandlers.putNotificationPreferences,
);
authRouter.get(
  AuthPaths.User.DailyCheckin,
  errorHandle(authMiddleware),
  authHandlers.dailyCheckinGet,
);
authRouter.post(
  AuthPaths.User.DailyCheckin,
  errorHandle(authMiddleware),
  authHandlers.dailyCheckinClaim,
);
authRouter.get(
  AuthPaths.User.Onboarding,
  errorHandle(authMiddleware),
  authHandlers.getOnboarding,
);
authRouter.put(
  AuthPaths.User.Onboarding,
  errorHandle(authMiddleware),
  authHandlers.putOnboarding,
);

apiRouter.use(AuthPaths.User._, authRouter);
export default apiRouter;
