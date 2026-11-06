import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { signToken, getTokenExpiresAt, verifyToken } from '@src/common/utils/jwt';
import { mailService } from '@src/common/utils/mail';
import { comparePassword, hashPassword } from '@src/common/utils/password';
import { verifyAppleIdentityToken } from '@src/common/utils/apple-auth';
import { RouteError } from '@src/common/utils/route-errors';
import type { CookieOptions, Request } from 'express';
import logger from 'jet-logger';
import { OAuth2Client } from 'google-auth-library';
import {
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UserPublic,
  type VerifyEmailInput,
} from '@src/models/User.model';
import { type AuthUser, parseAuthUser } from '@src/models/common/types';
import MediaService from '@src/services/MediaService';
import {
  assignRoleToUser,
  findByName,
} from '@src/repos/RoleRepo';
import * as AuthSessionRepo from '@src/repos/AuthSessionRepo';
import {
  create,
  createVerifyToken,
  findByEmail,
  findByEmailOrUserName,
  findByUserName,
  findById,
  findByVerifyToken,
  getRoleNames,
  saveSession,
  clearSession,
  setVerified,
  toPublicUser,
  update,
} from '@src/repos/UserRepo';

const Errors = {
  EMAIL_EXISTS: 'Email already registered',
  USERNAME_EXISTS: 'Username already taken',
  INVALID_CREDENTIALS: 'Invalid email/username or password',
  USER_NOT_FOUND: 'User not found',
  INVALID_VERIFY_TOKEN: 'Invalid or expired verification token',
  ALREADY_VERIFIED: 'Email is already verified',
  DEFAULT_ROLE_NOT_FOUND: 'Default role not found',
  SESSION_EXPIRED: 'Session expired or invalid',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  NO_PASSWORD: 'Account does not use password login',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
  ACCOUNT_LOCKED: 'Account is locked',
  INVALID_REFRESH: 'Invalid or expired refresh token',
  REFRESH_REUSED: 'Refresh token reuse detected',
} as const;

export type SessionDeviceInput = {
  deviceId?: string | null;
  platform?: string | null;
  appVersion?: string | null;
};

function resolveDeviceId(input?: SessionDeviceInput, req?: Request): string {
  const fromBody = input?.deviceId?.trim();
  const fromHeader = req?.get('x-device-id')?.trim();
  return fromBody || fromHeader || `web-${req?.ip ?? 'unknown'}`;
}

function resolvePlatform(
  input?: SessionDeviceInput,
  req?: Request,
): string | null {
  return input?.platform?.trim() || req?.get('x-app-platform')?.trim() || null;
}

function resolveAppVersion(
  input?: SessionDeviceInput,
  req?: Request,
): string | null {
  return (
    input?.appVersion?.trim() || req?.get('x-app-version')?.trim() || null
  );
}

async function issueTokens(
  user: { id: number; email: string },
  device?: SessionDeviceInput,
  req?: Request,
) {
  const deviceId = resolveDeviceId(device, req);
  const { session, refreshToken } = await AuthSessionRepo.createSession({
    userId: user.id,
    deviceId,
    platform: resolvePlatform(device, req),
    appVersion: resolveAppVersion(device, req),
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    sid: session.id,
  });
  const expiresAt = getTokenExpiresAt(token);
  await saveSession(user.id, token, expiresAt);

  return {
    token,
    refreshToken,
    expiresAt,
    sessionId: session.id,
    deviceId,
  };
}

async function getUserPublic(userId: number): Promise<UserPublic> {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  const roles = await getRoleNames(userId);
  return toPublicUser(user, roles);
}

async function register(input: RegisterInput) {
  const existingEmail = await findByEmail(input.email);
  if (existingEmail) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.EMAIL_EXISTS);
  }

  const existingUserName = await findByUserName(input.user_name);
  if (existingUserName) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.USERNAME_EXISTS);
  }

  const verifyTokenValue = createVerifyToken();
  const passwordHash =
    input.type === 'default' && input.password
      ? await hashPassword(input.password)
      : null;

  const user = await create({
    userName: input.user_name,
    email: input.email,
    passwordHash,
    type: input.type,
    providerId: input.provider_id ?? null,
    verifyToken: verifyTokenValue,
    verified: false,
  });

  const defaultRole = await findByName('user');
  if (!defaultRole) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      Errors.DEFAULT_ROLE_NOT_FOUND,
    );
  }
  await assignRoleToUser(user.id, defaultRole.id);

  if (input.type === 'default') {
    const verifyUrl = `${EnvVars.AppUrl}/api/user/verify-email?token=${verifyTokenValue}`;
    try {
      await mailService.sendVerificationEmail({
        to: user.email,
        userName: user.userName,
        verifyUrl,
      });
    } catch (error) {
      logger.err(`Failed to send verification email to ${user.email}: ${error}`);
    }
  }

  const response: {
    message: string;
    verifyToken?: string;
  } = {
    message: 'Registered. Please verify your email.',
  };

  if (EnvVars.NodeEnv === NodeEnvs.DEV) {
    response.verifyToken = verifyTokenValue;
  }

  return response;
}

async function login(
  input: LoginInput,
  device?: SessionDeviceInput,
  req?: Request,
) {
  const user = await findByEmailOrUserName(input.email, input.user_name);

  if (!user || user.type !== 'default') {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  if (!user.passwordHash) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  if (user.isLocked) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.ACCOUNT_LOCKED);
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  return issueTokens(user, device, req);
}

async function googleLogin(
  idToken: string,
  device?: SessionDeviceInput,
  req?: Request,
) {
  if (!EnvVars.GoogleClientId) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'Google Login is not configured',
    );
  }

  const client = new OAuth2Client(EnvVars.GoogleClientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: EnvVars.GoogleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      'Invalid Google Token',
    );
  }

  let user = await findByEmail(payload.email);

  if (user?.isLocked) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.ACCOUNT_LOCKED);
  }

  if (!user) {
    let baseUserName = payload.name || payload.email.split('@')[0];
    if (baseUserName.length > 40) {
      baseUserName = baseUserName.substring(0, 40);
    }
    
    let uniqueUserName = baseUserName;
    let suffix = 1;
    while (await findByUserName(uniqueUserName)) {
       uniqueUserName = `${baseUserName}_${suffix}`;
       suffix++;
    }

    // Register new user automatically
    user = await create({
      userName: uniqueUserName,
      email: payload.email,
      passwordHash: null,
      type: 'google',
      providerId: payload.sub,
      verifyToken: createVerifyToken(),
      verified: true, // Google email is already verified
    });

    const defaultRole = await findByName('user');
    if (defaultRole) {
      await assignRoleToUser(user.id, defaultRole.id);
    }
  }

  return issueTokens(user, device, req);
}

async function appleLogin(
  identityToken: string,
  device?: SessionDeviceInput,
  req?: Request,
) {
  const apple = await verifyAppleIdentityToken(identityToken);
  if (!apple.email) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Apple account email is required on first login',
    );
  }

  let user = await findByEmail(apple.email);
  if (user?.isLocked) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.ACCOUNT_LOCKED);
  }

  if (!user) {
    let baseUserName = apple.email.split('@')[0];
    if (baseUserName.length > 40) {
      baseUserName = baseUserName.substring(0, 40);
    }
    let uniqueUserName = baseUserName;
    let suffix = 1;
    while (await findByUserName(uniqueUserName)) {
      uniqueUserName = `${baseUserName}_${suffix}`;
      suffix += 1;
    }

    user = await create({
      userName: uniqueUserName,
      email: apple.email,
      passwordHash: null,
      type: 'apple',
      providerId: apple.sub,
      verifyToken: createVerifyToken(),
      verified: true,
    });

    const defaultRole = await findByName('user');
    if (defaultRole) {
      await assignRoleToUser(user.id, defaultRole.id);
    }
  } else if (!user.providerId) {
    await update(user.id, { providerId: apple.sub, type: 'apple' });
  }

  return issueTokens(user, device, req);
}

async function me(userId: number): Promise<UserPublic> {
  return getUserPublic(userId);
}

async function updateMe(
  userId: number,
  data: { userName?: string; avatarUrl?: string | null; coverUrl?: string | null },
): Promise<UserPublic> {
  const patch: {
    userName?: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
  } = {};

  if (data.userName !== undefined) {
    if (data.userName.length < 3 || data.userName.length > 50) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Username must be between 3 and 50 characters',
      );
    }
    const existing = await findByUserName(data.userName);
    if (existing && existing.id !== userId) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.USERNAME_EXISTS);
    }
    patch.userName = data.userName;
  }

  if (data.avatarUrl !== undefined) {
    patch.avatarUrl = data.avatarUrl;
  }
  if (data.coverUrl !== undefined) {
    patch.coverUrl = data.coverUrl;
  }

  if (Object.keys(patch).length > 0) {
    await update(userId, patch);
  }
  return getUserPublic(userId);
}

async function uploadProfileImage(
  userId: number,
  kind: 'avatar' | 'cover',
  file: Parameters<typeof MediaService.uploadThumbnail>[0],
): Promise<UserPublic> {
  const media = await MediaService.uploadThumbnail(file, userId);
  if (kind === 'avatar') {
    await update(userId, { avatarUrl: media.url });
  } else {
    await update(userId, { coverUrl: media.url });
  }
  return getUserPublic(userId);
}

async function verifyEmail(input: VerifyEmailInput) {
  const user = await findByVerifyToken(input.token);
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_VERIFY_TOKEN,
    );
  }

  if (user.verified) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ALREADY_VERIFIED);
  }

  await setVerified(user.id);

  return { message: 'Email verified successfully.' };
}

function frontendOrigin(): string {
  return EnvVars.FrontendUrl.split(',')[0]?.trim().replace(/\/$/, '') || '';
}

async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  if (!user.passwordHash) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NO_PASSWORD);
  }

  const ok = await comparePassword(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_CURRENT_PASSWORD,
    );
  }

  const passwordHash = await hashPassword(input.newPassword);
  await update(userId, { passwordHash });
  await AuthSessionRepo.revokeAllForUser(userId);
  await clearSession(userId);
  return { message: 'Password updated successfully.' };
}

/**
 * Always returns the same message to avoid email enumeration.
 * Reuses verifyToken for verified password accounts.
 */
async function forgotPassword(input: ForgotPasswordInput) {
  const generic = {
    message:
      'If an account exists for that email, a reset link has been sent.',
  };

  const user = await findByEmail(input.email);
  if (!user || !user.verified || !user.passwordHash) {
    return generic;
  }

  const token = createVerifyToken();
  await update(user.id, { verifyToken: token });

  const resetUrl = `${frontendOrigin()}/reset-password?token=${token}`;
  try {
    await mailService.sendPasswordResetEmail({
      to: user.email,
      userName: user.userName,
      resetUrl,
    });
  } catch (error) {
    logger.err('Failed to send password reset email');
    logger.err(error);
  }

  if (EnvVars.NodeEnv === NodeEnvs.DEV) {
    return { ...generic, resetToken: token };
  }

  return generic;
}

async function resetPassword(input: ResetPasswordInput) {
  const user = await findByVerifyToken(input.token);
  if (!user || !user.verified) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_RESET_TOKEN,
    );
  }

  const passwordHash = await hashPassword(input.newPassword);
  await update(user.id, { passwordHash, verifyToken: null });
  await AuthSessionRepo.revokeAllForUser(user.id);
  await clearSession(user.id);

  return { message: 'Password has been reset. Please sign in again.' };
}

export async function authenticate(token: string): Promise<AuthUser> {
  const payload = verifyToken(token);
  const user = await findById(payload.userId);

  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  if (user.isLocked) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.ACCOUNT_LOCKED);
  }

  if (payload.sid) {
    const session = await AuthSessionRepo.findById(payload.sid);
    if (!session || session.revokedAt || session.userId !== user.id) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.SESSION_EXPIRED);
    }
    if (session.expiresAt.getTime() < Date.now()) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.SESSION_EXPIRED);
    }
  }

  const roles = await getRoleNames(user.id);

  return parseAuthUser({
    id: user.id,
    email: user.email,
    roles,
    sessionId: payload.sid,
  });
}

async function refresh(
  refreshToken: string,
  device?: SessionDeviceInput,
  req?: Request,
) {
  const hash = AuthSessionRepo.hashRefreshToken(refreshToken);
  const session = await AuthSessionRepo.findActiveByRefreshHash(hash);

  if (!session) {
    const reused = await AuthSessionRepo.findByRefreshHash(hash);
    if (reused?.revokedAt) {
      await AuthSessionRepo.revokeFamily(reused.familyId);
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.REFRESH_REUSED);
    }
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.INVALID_REFRESH);
  }

  const user = await findById(session.userId);
  if (!user || user.isLocked) {
    await AuthSessionRepo.revokeFamily(session.familyId);
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.INVALID_REFRESH);
  }

  // Rotate: revoke old, create new in same family
  await AuthSessionRepo.revokeSession(session.id);
  const deviceId =
    resolveDeviceId(device, req) !== `web-${req?.ip ?? 'unknown'}`
      ? resolveDeviceId(device, req)
      : session.deviceId;

  const created = await AuthSessionRepo.createSession({
    userId: user.id,
    deviceId,
    platform: resolvePlatform(device, req) ?? session.platform,
    appVersion: resolveAppVersion(device, req) ?? session.appVersion,
    familyId: session.familyId,
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    sid: created.session.id,
  });
  const expiresAt = getTokenExpiresAt(token);
  await saveSession(user.id, token, expiresAt);

  return {
    token,
    refreshToken: created.refreshToken,
    expiresAt,
    sessionId: created.session.id,
    deviceId: created.session.deviceId,
  };
}

async function listSessions(userId: number) {
  const sessions = await AuthSessionRepo.listByUser(userId);
  return {
    data: sessions.map((s) => ({
      sessionId: s.id,
      deviceId: s.deviceId,
      platform: s.platform,
      appVersion: s.appVersion,
      lastUsedAt: s.lastUsedAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    })),
  };
}

async function revokeSession(userId: number, sessionId: string) {
  const session = await AuthSessionRepo.findById(sessionId);
  if (!session || session.userId !== userId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Session not found');
  }
  await AuthSessionRepo.revokeSession(sessionId);
  return { message: 'Session revoked.' };
}

async function revokeOtherSessions(userId: number, keepSessionId?: string) {
  if (!keepSessionId) {
    await AuthSessionRepo.revokeAllForUser(userId);
    return { message: 'All sessions revoked.' };
  }
  await AuthSessionRepo.revokeOthers(userId, keepSessionId);
  return { message: 'Other sessions revoked.' };
}

async function logout(
  userId: number,
  token?: string,
  sessionId?: string,
) {
  if (sessionId) {
    await AuthSessionRepo.revokeSession(sessionId);
  } else if (token) {
    try {
      const payload = verifyToken(token);
      if (payload.sid) {
        await AuthSessionRepo.revokeSession(payload.sid);
      }
    } catch {
      // ignore invalid token on logout
    }
  }

  if (token) {
    const user = await findById(userId);
    if (user?.accessToken === token) {
      await clearSession(userId);
    }
  } else {
    await clearSession(userId);
  }
  return { message: 'Logged out.' };
}

/**
 * Cookie options for access token.
 * Optional `req` enables Secure behind HTTPS reverse proxies (`x-forwarded-proto`).
 */
function getCookieOptions(req?: Request): CookieOptions {
  const isProd = EnvVars.NodeEnv === NodeEnvs.PRODUCTION;
  const configuredDomain = EnvVars.AuthCookieDomain?.trim();
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(',')[0]?.trim();
  const secure =
    isProd ||
    proto === 'https' ||
    Boolean(req?.secure);

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(isProd && configuredDomain
      ? { domain: configuredDomain }
      : {}),
  };
}

function getClearCookieOptions(req?: Request): CookieOptions {
  const { httpOnly, secure, sameSite, path, domain } = getCookieOptions(req);
  return { httpOnly, secure, sameSite, path, domain };
}

export default {
  Errors,
  register,
  login,
  googleLogin,
  appleLogin,
  me,
  updateMe,
  uploadProfileImage,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  authenticate,
  refresh,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  logout,
  getCookieOptions,
  getClearCookieOptions,
} as const;
