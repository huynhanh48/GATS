import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getRouteParam(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
}

export function getUuidRouteParam(
  value: string | string[] | undefined,
  name = 'id',
): string {
  const param = getRouteParam(value);
  if (!UUID_REGEX.test(param)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      `${name} must be a valid UUID`,
    );
  }
  return param;
}
