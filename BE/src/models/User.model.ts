import {
  loginPasswordSchema,
  passwordSchema,
} from '@src/common/utils/password';
import { z } from 'zod';

export const authTypeSchema = z.enum([
  'facebook',
  'apple',
  'google',
  'default',
]);

export const userRecordSchema = z.object({
  id: z.number().int().positive(),
  userName: z.string().min(1).max(50),
  passwordHash: z.string().nullable(),
  verified: z.boolean(),
  email: z.string().email(),
  type: authTypeSchema,
  providerId: z.string().nullable(),
  verifyToken: z.string().nullable(),
  accessToken: z.string().nullable(),
  tokenExpiresAt: z.coerce.date().nullable(),
  isLocked: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userPublicSchema = z.object({
  id: z.number().int().positive(),
  userName: z.string(),
  verified: z.boolean(),
  email: z.string().email(),
  type: authTypeSchema,
  roles: z.array(z.string()),
  isLocked: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    user_name: z.string().min(3).max(50),
    email: z.string().email(),
    password: passwordSchema.optional(),
    type: authTypeSchema.default('default'),
    provider_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'default' && !data.password) {
      ctx.addIssue({
        code: 'custom',
        message: 'password is required for default auth type',
        path: ['password'],
      });
    }
    if (data.type !== 'default' && !data.provider_id) {
      ctx.addIssue({
        code: 'custom',
        message: 'provider_id is required for OAuth auth types',
        path: ['provider_id'],
      });
    }
  });

function resolveLoginIdentity(data: {
  identifier?: string;
  email?: string;
  user_name?: string;
}): { email?: string; user_name?: string } {
  if (data.identifier) {
    const isEmail = z.string().email().safeParse(data.identifier).success;
    return isEmail
      ? { email: data.identifier }
      : { user_name: data.identifier };
  }

  if (data.user_name) {
    return { user_name: data.user_name };
  }

  if (data.email) {
    const isEmail = z.string().email().safeParse(data.email).success;
    return isEmail
      ? { email: data.email }
      : { user_name: data.email };
  }

  return {};
}

export const loginSchema = z
  .object({
    identifier: z.string().min(3).optional(),
    email: z.string().min(3).optional(),
    user_name: z.string().min(3).optional(),
    password: loginPasswordSchema,
  })
  .superRefine((data, ctx) => {
    const identity = resolveLoginIdentity(data);
    if (!identity.email && !identity.user_name) {
      ctx.addIssue({
        code: 'custom',
        message: 'identifier, email, or user_name is required',
        path: ['identifier'],
      });
    }
  })
  .transform((data) => ({
    password: data.password,
    ...resolveLoginIdentity(data),
  }));

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const registerResponseSchema = z.object({
  message: z.string(),
  verifyToken: z.string().optional(),
});

export const loginResponseSchema = z.object({
  message: z.string(),
  /** JWT for mobile / Bearer clients; web still uses httpOnly cookie. */
  token: z.string(),
  expiresAt: z.coerce.date(),
});

export const meResponseSchema = z.object({
  user: userPublicSchema,
});

export type AuthType = z.infer<typeof authTypeSchema>;
export type UserRecord = z.infer<typeof userRecordSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function parseRegisterInput(data: unknown): RegisterInput {
  return registerSchema.parse(data);
}

export function parseLoginInput(data: unknown): LoginInput {
  return loginSchema.parse(data);
}

export function parseVerifyEmailInput(data: unknown): VerifyEmailInput {
  return verifyEmailSchema.parse(data);
}

export function parseChangePasswordInput(data: unknown): ChangePasswordInput {
  return changePasswordSchema.parse(data);
}

export function parseForgotPasswordInput(data: unknown): ForgotPasswordInput {
  return forgotPasswordSchema.parse(data);
}

export function parseResetPasswordInput(data: unknown): ResetPasswordInput {
  return resetPasswordSchema.parse(data);
}

export function parseUserPublic(data: unknown): UserPublic {
  return userPublicSchema.parse(data);
}
