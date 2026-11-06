import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { HttpException } from '@src/exceptions/root';
import { ParseError } from 'jet-validators/utils';

export class RouteError extends HttpException {
  public constructor(
    status: HttpStatusCodes,
    message: string,
    code?: string,
    retryable = false,
    details?: unknown,
  ) {
    super(status, message, details, code, retryable);
  }
}

export class ValidationError extends RouteError {
  public static MESSAGE =
    'The parseObj() function discovered one or ' + 'more errors.';

  public constructor(errors: ParseError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg, 'VALIDATION_ERROR');
  }
}
