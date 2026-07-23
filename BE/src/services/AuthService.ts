import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { signToken, getTokenExpiresAt, verifyToken } from '@src/common/utils/jwt';
import { mailService } from '@src/common/utils/mail';
import { comparePassword, hashPassword } from '@src/common/utils/password';
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
import {
  assignRoleToUser,
  findByName,
} from '@src/repos/RoleRepo';
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
} as const;

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

async function login(input: LoginInput) {
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

  const token = signToken({ userId: user.id, email: user.email });
  const expiresAt = getTokenExpiresAt(token);
  await saveSession(user.id, token, expiresAt);

  return { token, expiresAt };
}

async function googleLogin(idToken: string) {
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

  const token = signToken({ userId: user.id, email: user.email });
  const expiresAt = getTokenExpiresAt(token);
  await saveSession(user.id, token, expiresAt);

  return { token, expiresAt };
}

async function me(userId: number): Promise<UserPublic> {
  return getUserPublic(userId);
}

async function updateMe(userId: number, data: { userName?: string }): Promise<UserPublic> {
  // Validate if userName is provided and not empty
  if (data.userName) {
    if (data.userName.length < 3 || data.userName.length > 50) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Username must be between 3 and 50 characters');
    }
    const existing = await findByUserName(data.userName);
    if (existing && existing.id !== userId) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.USERNAME_EXISTS);
    }
    await update(userId, { userName: data.userName });
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
  await clearSession(user.id);

  return { message: 'Password has been reset. Please sign in again.' };
}

export async function authenticate(token: string): Promise<AuthUser> {
  const payload = verifyToken(token);
  const user = await findById(payload.userId);

  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  // Allow concurrent sessions (same account on multiple devices/browsers).
  // JWT signature + exp are enough; do not require users.access_token match
  // (that field only stores the latest login and would kick other sessions).

  const roles = await getRoleNames(user.id);

  return parseAuthUser({
    id: user.id,
    email: user.email,
    roles,
  });
}

async function logout(userId: number, token?: string) {
  // Only clear the stored "latest" token if it matches this logout,
  // so logging out one browser does not wipe another device's cookie validity
  // (authenticate no longer depends on the stored token anyway).
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
  me,
  updateMe,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  authenticate,
  logout,
  getCookieOptions,
  getClearCookieOptions,
} as const;
