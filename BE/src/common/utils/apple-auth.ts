import { createPublicKey } from 'crypto';

import jwt from 'jsonwebtoken';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';

type AppleJwtHeader = { kid?: string; alg?: string };
type AppleJwtPayload = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
};

type AppleJwks = {
  keys: Array<{
    kid?: string;
    kty: string;
    n: string;
    e: string;
    alg?: string;
    use?: string;
  }>;
};

let cachedJwks: { fetchedAt: number; keys: AppleJwks['keys'] } | null = null;

async function fetchAppleJwks(): Promise<AppleJwks['keys']> {
  const now = Date.now();
  if (cachedJwks && now - cachedJwks.fetchedAt < 60 * 60 * 1000) {
    return cachedJwks.keys;
  }
  const res = await fetch('https://appleid.apple.com/auth/keys');
  if (!res.ok) {
    throw new RouteError(
      HttpStatusCodes.BAD_GATEWAY,
      'Failed to fetch Apple JWKS',
    );
  }
  const body = (await res.json()) as AppleJwks;
  cachedJwks = { fetchedAt: now, keys: body.keys ?? [] };
  return cachedJwks.keys;
}

export async function verifyAppleIdentityToken(identityToken: string): Promise<{
  sub: string;
  email: string | null;
}> {
  const audience = EnvVars.AppleClientId;
  if (!audience) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'Apple Login is not configured',
    );
  }

  const [headerB64] = identityToken.split('.');
  if (!headerB64) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid Apple Token');
  }
  const header = JSON.parse(
    Buffer.from(headerB64, 'base64url').toString('utf8'),
  ) as AppleJwtHeader;

  const keys = await fetchAppleJwks();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk?.n || !jwk?.e) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid Apple Token');
  }

  const keyObject = createPublicKey({
    key: jwk,
    format: 'jwk',
  });

  let payload: AppleJwtPayload;
  try {
    payload = jwt.verify(identityToken, keyObject, {
      algorithms: ['RS256'],
      audience,
      issuer: 'https://appleid.apple.com',
    }) as AppleJwtPayload;
  } catch {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid Apple Token');
  }

  if (!payload.sub) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid Apple Token');
  }

  return {
    sub: payload.sub,
    email: payload.email ?? null,
  };
}
