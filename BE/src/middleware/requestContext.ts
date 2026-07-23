import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';

function requestContext(req: Request, res: Response, next: NextFunction) {
  const supplied = req.get('x-request-id');
  const requestId =
    supplied && supplied.length <= 128 ? supplied : randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  res.on('finish', () => {
    if (EnvVars.NodeEnv === NodeEnvs.TEST) return;
    console.log(
      JSON.stringify({
        level: res.statusCode >= 500 ? 'error' : 'info',
        event: 'http_request',
        requestId,
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
        ip: req.ip,
      }),
    );
  });

  next();
}

export default requestContext;
