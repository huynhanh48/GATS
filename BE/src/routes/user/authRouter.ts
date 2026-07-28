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
  parseChangePasswordInput,
  parseForgotPasswordInput,
  parseLoginInput,
  parseRegisterInput,
  parseResetPasswordInput,
  parseVerifyEmailInput,
  verifyEmailSchema,
} from '@src/models/User.model';
import AuthService from '@src/services/AuthService';

const APP_NAME = 'GATS Academy';

function setAccessTokenCookie(
  req: Request,
  res: Response,
  token: string,
): void {
  const options = AuthService.getCookieOptions(req);

  // Remove the old api.gats.vn host-only cookie before switching to the
  // shared parent-domain cookie. Otherwise browsers may send two cookies with
  // the same name and authentication becomes order-dependent.
  if (options.domain) {
    const { domain: _domain, ...legacyHostOptions } =
      AuthService.getClearCookieOptions(req);
    res.clearCookie(ACCESS_TOKEN_COOKIE, legacyHostOptions);
  }

  res.cookie(ACCESS_TOKEN_COOKIE, token, options);
}

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
  const device = {
    deviceId: req.body?.deviceId,
    platform: req.body?.platform,
    appVersion: req.body?.appVersion,
  };
  const result = await AuthService.login(input, device, req);
  setAccessTokenCookie(req, res, result.token);
  return res.status(HttpStatusCodes.OK).json({
    message: 'Logged in.',
    token: result.token,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
    sessionId: result.sessionId,
  });
}

async function googleLogin(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken || typeof idToken !== 'string') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'idToken is required');
  }

  const device = {
    deviceId: req.body?.deviceId,
    platform: req.body?.platform,
    appVersion: req.body?.appVersion,
  };
  const result = await AuthService.googleLogin(idToken, device, req);
  setAccessTokenCookie(req, res, result.token);
  return res.status(HttpStatusCodes.OK).json({
    message: 'Logged in with Google.',
    token: result.token,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
    sessionId: result.sessionId,
  });
}

async function appleLogin(req: Request, res: Response) {
  const identityToken =
    typeof req.body?.identityToken === 'string'
      ? req.body.identityToken
      : typeof req.body?.idToken === 'string'
        ? req.body.idToken
        : null;
  if (!identityToken) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'identityToken is required',
    );
  }
  const device = {
    deviceId: req.body?.deviceId,
    platform: req.body?.platform,
    appVersion: req.body?.appVersion,
  };
  const result = await AuthService.appleLogin(identityToken, device, req);
  setAccessTokenCookie(req, res, result.token);
  return res.status(HttpStatusCodes.OK).json({
    message: 'Logged in with Apple.',
    token: result.token,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
    sessionId: result.sessionId,
  });
}

async function refresh(req: Request, res: Response) {
  const refreshToken =
    typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null;
  if (!refreshToken) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'refreshToken is required',
    );
  }
  const device = {
    deviceId: req.body?.deviceId,
    platform: req.body?.platform,
    appVersion: req.body?.appVersion,
  };
  const result = await AuthService.refresh(refreshToken, device, req);
  setAccessTokenCookie(req, res, result.token);
  return res.status(HttpStatusCodes.OK).json({
    message: 'Token refreshed.',
    token: result.token,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
    sessionId: result.sessionId,
  });
}

async function listSessions(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const result = await AuthService.listSessions(req.authUser.id);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function revokeSession(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const sessionId = String(req.params.sessionId ?? '');
  const result = await AuthService.revokeSession(req.authUser.id, sessionId);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function revokeOtherSessions(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const result = await AuthService.revokeOtherSessions(
    req.authUser.id,
    req.authUser.sessionId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function logout(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  const result = await AuthService.logout(
    req.authUser.id,
    token,
    req.authUser.sessionId,
  );
  res.clearCookie(
    ACCESS_TOKEN_COOKIE,
    AuthService.getClearCookieOptions(req),
  );
  const { domain, ...legacyHostOptions } =
    AuthService.getClearCookieOptions(req);
  if (domain) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, legacyHostOptions);
  }
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

async function changePassword(req: Request, res: Response) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  const input = parseChangePasswordInput(req.body);
  const result = await AuthService.changePassword(req.authUser.id, input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function forgotPassword(req: Request, res: Response) {
  const input = parseForgotPasswordInput(req.body);
  const result = await AuthService.forgotPassword(input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function resetPassword(req: Request, res: Response) {
  const input = parseResetPasswordInput(req.body);
  const result = await AuthService.resetPassword(input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function registerDevice(req: Request, res: Response) {
  const DeviceService = (await import('@src/services/DeviceService')).default;
  const result = await DeviceService.registerDevice(
    req.authUser!.id,
    req.body,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function updateDevice(req: Request, res: Response) {
  const DeviceService = (await import('@src/services/DeviceService')).default;
  const result = await DeviceService.updateDevice(
    req.authUser!.id,
    String(req.params.deviceId),
    req.body,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function removeDevice(req: Request, res: Response) {
  const DeviceService = (await import('@src/services/DeviceService')).default;
  const result = await DeviceService.removeDevice(
    req.authUser!.id,
    String(req.params.deviceId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getNotificationPreferences(req: Request, res: Response) {
  const DeviceService = (await import('@src/services/DeviceService')).default;
  const result = await DeviceService.getPreferences(req.authUser!.id);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function putNotificationPreferences(req: Request, res: Response) {
  const DeviceService = (await import('@src/services/DeviceService')).default;
  const result = await DeviceService.updatePreferences(
    req.authUser!.id,
    req.body,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function dailyCheckinGet(req: Request, res: Response) {
  const DailyCheckinService = (await import('@src/services/DailyCheckinService'))
    .default;
  const result = await DailyCheckinService.getStatus(
    req.authUser!.id,
    req.get('x-timezone') ?? undefined,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function dailyCheckinClaim(req: Request, res: Response) {
  const DailyCheckinService = (await import('@src/services/DailyCheckinService'))
    .default;
  const result = await DailyCheckinService.claim(
    req.authUser!.id,
    req.get('x-timezone') ?? undefined,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getOnboarding(req: Request, res: Response) {
  const { findById } = await import('@src/repos/UserRepo');
  const user = await findById(req.authUser!.id);
  return res.status(HttpStatusCodes.OK).json({
    data: {
      answers: user?.onboardingAnswers ?? null,
      completedAt: user?.onboardingCompletedAt ?? null,
    },
  });
}

async function putOnboarding(req: Request, res: Response) {
  const { saveOnboarding } = await import('@src/repos/UserRepo');
  const answers =
    req.body?.answers && typeof req.body.answers === 'object'
      ? req.body.answers
      : req.body;
  await saveOnboarding(req.authUser!.id, answers as Record<string, unknown>);
  return res.status(HttpStatusCodes.OK).json({
    message: 'Onboarding saved',
    data: { answers },
  });
}

export default {
  register: errorHandle(register),
  login: errorHandle(login),
  googleLogin: errorHandle(googleLogin),
  appleLogin: errorHandle(appleLogin),
  refresh: errorHandle(refresh),
  listSessions: errorHandle(listSessions),
  revokeSession: errorHandle(revokeSession),
  revokeOtherSessions: errorHandle(revokeOtherSessions),
  logout: errorHandle(logout),
  me: errorHandle(me),
  updateMe: errorHandle(updateMe),
  verifyEmail: errorHandle(verifyEmail),
  verifyEmailByLink: errorHandle(verifyEmailByLink),
  changePassword: errorHandle(changePassword),
  forgotPassword: errorHandle(forgotPassword),
  resetPassword: errorHandle(resetPassword),
  registerDevice: errorHandle(registerDevice),
  updateDevice: errorHandle(updateDevice),
  removeDevice: errorHandle(removeDevice),
  getNotificationPreferences: errorHandle(getNotificationPreferences),
  putNotificationPreferences: errorHandle(putNotificationPreferences),
  dailyCheckinGet: errorHandle(dailyCheckinGet),
  dailyCheckinClaim: errorHandle(dailyCheckinClaim),
  getOnboarding: errorHandle(getOnboarding),
  putOnboarding: errorHandle(putOnboarding),
} as const;
