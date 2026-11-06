import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

import EnvVars from '@src/common/constants/env';

export const jwtPayloadSchema = z.object({
  userId: z.number().int().positive(),
  email: z.string().email(),
  sid: z.string().uuid().optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: EnvVars.JwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, EnvVars.JwtSecret, options);
}

export function getTokenExpiresAt(token: string): Date {
  const decoded = jwt.decode(token);
  const payload = z.object({ exp: z.number() }).parse(decoded);
  return new Date(payload.exp * 1000);
}

export function verifyToken(token: string): JwtPayload {
  const decoded: unknown = jwt.verify(token, EnvVars.JwtSecret);
  return jwtPayloadSchema.parse(decoded);
}
