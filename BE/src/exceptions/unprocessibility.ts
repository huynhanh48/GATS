import type { ZodIssue } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

import { HttpException } from './root';

export class UnprocessibilityException extends HttpException {
  public constructor(message: string, issues: ZodIssue[]) {
    super(HttpStatusCodes.UNPROCESSABLE_ENTITY, message, issues);
  }
}
