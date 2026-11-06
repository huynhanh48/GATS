import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

export class HttpException extends Error {
  public readonly status: HttpStatusCodes;
  public readonly issues?: unknown;
  public readonly code?: string;
  public readonly retryable: boolean;
  public readonly details?: unknown;

  public constructor(
    status: HttpStatusCodes,
    message: string,
    issues?: unknown,
    code?: string,
    retryable = false,
  ) {
    super(message);
    this.status = status;
    this.issues = issues;
    this.details = issues;
    this.code = code ?? `HTTP_${status}`;
    this.retryable = retryable;
  }
}

export function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}
