import type { NextFunction, Request, Response } from 'express';

/**
 * Attach meta.requestId + meta.serverTime on successful JSON responses.
 */
function responseMeta(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      res.statusCode >= 200 &&
      res.statusCode < 300
    ) {
      const record = body as Record<string, unknown>;
      const existingMeta =
        record.meta && typeof record.meta === 'object' && !Array.isArray(record.meta)
          ? (record.meta as Record<string, unknown>)
          : {};
      record.meta = {
        ...existingMeta,
        requestId: existingMeta.requestId ?? res.locals.requestId,
        serverTime: existingMeta.serverTime ?? new Date().toISOString(),
      };
      return originalJson(record);
    }
    return originalJson(body);
  }) as typeof res.json;
  next();
}

export default responseMeta;
