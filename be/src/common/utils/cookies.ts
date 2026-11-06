import { Request } from 'express';
import { z } from 'zod';

import { ACCESS_TOKEN_COOKIE } from '@src/common/constants/auth';

const cookiesSchema = z.record(z.string(), z.unknown());
const accessTokenSchema = z.string().min(1);

export function getAccessTokenFromRequest(req: Request): string | undefined {
  const cookies = cookiesSchema.safeParse(req.cookies);
  if (!cookies.success) return undefined;

  const raw = cookies.data[ACCESS_TOKEN_COOKIE];
  const token = accessTokenSchema.safeParse(raw);
  return token.success ? token.data : undefined;
}
