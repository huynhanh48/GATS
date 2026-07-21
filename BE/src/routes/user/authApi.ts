import AuthPaths from '@src/common/paths/auth';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
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
  AuthPaths.User.ChangePassword,
  errorHandle(authMiddleware),
  authHandlers.changePassword,
);

apiRouter.use(AuthPaths.User._, authRouter);
export default apiRouter;
