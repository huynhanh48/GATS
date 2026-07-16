import AuthPaths from '@src/common/paths/auth';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import { Router } from 'express';
import authHandlers from './authRouter';

const apiRouter = Router();
const authRouter = Router();

authRouter.post(AuthPaths.User.Register, authHandlers.register);
authRouter.post(AuthPaths.User.Login, authHandlers.login);
authRouter.post(AuthPaths.User.VerifyEmail, authHandlers.verifyEmail);
authRouter.get(AuthPaths.User.VerifyEmail, authHandlers.verifyEmailByLink);
authRouter.post(
  AuthPaths.User.Logout,
  errorHandle(authMiddleware),
  authHandlers.logout,
);
authRouter.get(AuthPaths.User.Me, errorHandle(authMiddleware), authHandlers.me);

apiRouter.use(AuthPaths.User._, authRouter);
export default apiRouter;
