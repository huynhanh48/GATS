import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseApplyCouponInput,
  parseCouponListQuery,
  parseCreateCouponInput,
  parseUpdateCouponInput,
} from '@src/models/Coupon.model';
import CouponService from '@src/services/CouponService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function create(req: Request, res: Response) {
  const input = parseCreateCouponInput(req.body);
  const result = await CouponService.create(input, authUserId(req));
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function list(req: Request, res: Response) {
  const query = parseCouponListQuery(req.query);
  const result = await CouponService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getById(req: Request, res: Response) {
  const result = await CouponService.getById(getRouteParam(req.params.id));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function update(req: Request, res: Response) {
  const input = parseUpdateCouponInput(req.body);
  const result = await CouponService.update(
    getRouteParam(req.params.id),
    input,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function remove(req: Request, res: Response) {
  const result = await CouponService.remove(
    getRouteParam(req.params.id),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function preview(req: Request, res: Response) {
  const input = parseApplyCouponInput(req.body);
  const result = await CouponService.preview(input.code, input.orderAmount, {
    scope: input.scope,
    membershipPlanId: input.membershipPlanId,
  });
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  create: errorHandle(create),
  list: errorHandle(list),
  getById: errorHandle(getById),
  update: errorHandle(update),
  remove: errorHandle(remove),
  preview: errorHandle(preview),
};
