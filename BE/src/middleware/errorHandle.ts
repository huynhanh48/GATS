import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

import { HttpException } from '@src/exceptions/root';
import { UnprocessibilityException } from '@src/exceptions/unprocessibility';

export const errorHandle = (method: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      let instance: HttpException;

      if (error instanceof ZodError) {
        const issues = error.issues;
        const firstIssue = issues[0];
        const message = firstIssue
          ? `Validation Error (${firstIssue.path.join('.')}): ${firstIssue.message}`
          : 'Unprocessable Entity';

        instance = new UnprocessibilityException(message, issues);
      } else if (error instanceof HttpException) {
        instance = error;
      } else {
        instance = error as HttpException;
      }

      next(instance);
    }
  };
};
