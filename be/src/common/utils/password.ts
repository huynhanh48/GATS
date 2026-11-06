import bcrypt from 'bcryptjs';
import { z } from 'zod';

const SALT_ROUNDS = 10;

/** More than 6 chars, 1 uppercase, 1 special char, letters and numbers. */
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'Password must be more than 6 characters and include at least one uppercase letter, one number, and one special character';

export const passwordSchema = z
  .string()
  .regex(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE });

export const loginPasswordSchema = z.string().min(1, {
  message: 'password is required',
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
