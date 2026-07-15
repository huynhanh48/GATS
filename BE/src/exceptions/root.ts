import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

export class HttpException extends Error {
  public readonly status: HttpStatusCodes;
  public readonly issues?: unknown;

  public constructor(
    status: HttpStatusCodes,
    message: string,
    issues?: unknown,
  ) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

export function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}
