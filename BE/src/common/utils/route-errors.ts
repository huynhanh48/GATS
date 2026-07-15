import { ParseError } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { HttpException } from '@src/exceptions/root';

/******************************************************************************
                                 Classes
******************************************************************************/

/**
 * Error with status code and message.
 */
export class RouteError extends HttpException {
  public constructor(status: HttpStatusCodes, message: string) {
    super(status, message);
  }
}

/**
 * Handle "parseObj" errors.
 */
export class ValidationError extends RouteError {
  public static MESSAGE =
    'The parseObj() function discovered one or ' + 'more errors.';

  public constructor(errors: ParseError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg);
  }
}
