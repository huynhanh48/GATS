import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { signToken, getTokenExpiresAt, verifyToken } from '@src/common/utils/jwt';
import { mailService } from '@src/common/utils/mail';
import { comparePassword, hashPassword } from '@src/common/utils/password';
import { RouteError } from '@src/common/utils/route-errors';
import logger from 'jet-logger';
import {
  type LoginInput,
  type RegisterInput,
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
  findById,
  findByUserName,
  findByVerifyToken,
  getRoleNames,
  saveSession,
  clearSession,
  setVerified,
  toPublicUser,
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

async function me(userId: number): Promise<UserPublic> {
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

export async function authenticate(token: string): Promise<AuthUser> {
  const payload = verifyToken(token);
  const user = await findById(payload.userId);

  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  if (!user.accessToken || user.accessToken !== token) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.SESSION_EXPIRED);
  }

  if (!user.tokenExpiresAt || user.tokenExpiresAt.getTime() < Date.now()) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.SESSION_EXPIRED);
  }

  const roles = await getRoleNames(user.id);

  return parseAuthUser({
    id: user.id,
    email: user.email,
    roles,
  });
}

async function logout(userId: number) {
  await clearSession(userId);
  return { message: 'Logged out.' };
}

function getCookieOptions() {
  const isProd = EnvVars.NodeEnv === NodeEnvs.PRODUCTION;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // Omit domain so the cookie stays host-only (api host in prod;
    // fine for localhost cross-port FE↔BE in development).
  };
}

function getClearCookieOptions() {
  const { httpOnly, secure, sameSite, path } = getCookieOptions();
  return { httpOnly, secure, sameSite, path };
}

export default {
  Errors,
  register,
  login,
  me,
  verifyEmail,
  authenticate,
  logout,
  getCookieOptions,
  getClearCookieOptions,
} as const;
