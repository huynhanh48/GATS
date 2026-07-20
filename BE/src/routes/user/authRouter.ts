import { Request, Response } from 'express';

import { ACCESS_TOKEN_COOKIE } from '@src/common/constants/auth';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import {
  VERIFY_EMAIL_RESULT_STATUS_CONFIG,
  type VerifyEmailResultStatus,
} from '@src/common/constants/verify-email-result';
import { mailService } from '@src/common/utils/mail';
import { RouteError } from '@src/common/utils/route-errors';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseLoginInput,
  parseRegisterInput,
  parseVerifyEmailInput,
  verifyEmailSchema,
} from '@src/models/User.model';
import AuthService from '@src/services/AuthService';

const APP_NAME = 'GATS Academy';

function renderVerifyEmailResultPage(input: {
  title: string;
  message: string;
  status: VerifyEmailResultStatus;
}): string {
  const statusConfig = VERIFY_EMAIL_RESULT_STATUS_CONFIG[input.status];

  return mailService.renderTemplate('verify-email-result.html', {
    appName: APP_NAME,
    title: input.title,
    message: input.message,
    year: new Date().getFullYear(),
    ...statusConfig,
  });
}

async function register(req: Request, res: Response) {
  const input = parseRegisterInput(req.body);
  const result = await AuthService.register(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function login(req: Request, res: Response) {
  const input = parseLoginInput(req.body);
  const result = await AuthService.login(input);
  res.cookie(ACCESS_TOKEN_COOKIE, result.token, AuthService.getCookieOptions());
  // Cookie for web (admin/web-app); `token` in body for mobile Bearer clients.
  return res.status(HttpStatusCodes.OK).json({
    message: 'Logged in.',
    token: result.token,
    expiresAt: result.expiresAt,
  });
}

async function googleLogin(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken || typeof idToken !== 'string') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'idToken is required');
  }

  const result = await AuthService.googleLogin(idToken);
  res.cookie(ACCESS_TOKEN_COOKIE, result.token, AuthService.getCookieOptions());
  return res.status(HttpStatusCodes.OK).json({
    message: 'Logged in with Google.',
    token: result.token,
    expiresAt: result.expiresAt,
  });
}

async function logout(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  const result = await AuthService.logout(req.authUser.id, token);
  res.clearCookie(ACCESS_TOKEN_COOKIE, AuthService.getClearCookieOptions());
  return res.status(HttpStatusCodes.OK).json(result);
}

async function me(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const user = await AuthService.me(req.authUser.id);
  return res.status(HttpStatusCodes.OK).json({ user });
}

async function updateMe(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const user = await AuthService.updateMe(req.authUser.id, req.body);
  return res.status(HttpStatusCodes.OK).json({ user });
}

async function verifyEmail(req: Request, res: Response) {
  const input = parseVerifyEmailInput(req.body);
  const result = await AuthService.verifyEmail(input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function verifyEmailByLink(req: Request, res: Response) {
  const parsed = verifyEmailSchema.safeParse({ token: req.query.token });
  if (!parsed.success) {
    const html = renderVerifyEmailResultPage({
      title: 'Xác thực thất bại',
      message: 'Link không hợp lệ hoặc thiếu mã xác thực.',
      status: 'error',
    });
    return res.status(HttpStatusCodes.BAD_REQUEST).type('html').send(html);
  }

  try {
    await AuthService.verifyEmail(parsed.data);
    const html = renderVerifyEmailResultPage({
      title: 'Xác thực thành công',
      message: 'Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.',
      status: 'success',
    });
    return res.status(HttpStatusCodes.OK).type('html').send(html);
  } catch (error) {
    if (!(error instanceof RouteError)) {
      throw error;
    }

    const isAlreadyVerified =
      error.message === AuthService.Errors.ALREADY_VERIFIED;
    const html = renderVerifyEmailResultPage({
      title: isAlreadyVerified ? 'Đã xác thực' : 'Xác thực thất bại',
      message: isAlreadyVerified
        ? 'Email này đã được xác thực trước đó.'
        : 'Link không hợp lệ hoặc đã hết hạn.',
      status: isAlreadyVerified ? 'info' : 'error',
    });
    return res.status(error.status).type('html').send(html);
  }
}

export default {
  register: errorHandle(register),
  login: errorHandle(login),
  googleLogin: errorHandle(googleLogin),
  logout: errorHandle(logout),
  me: errorHandle(me),
  updateMe: errorHandle(updateMe),
  verifyEmail: errorHandle(verifyEmail),
  verifyEmailByLink: errorHandle(verifyEmailByLink),
} as const;
