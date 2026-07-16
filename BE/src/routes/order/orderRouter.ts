import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import { parseCreateOrderInput } from '@src/models/Order.model';
import OrderService from '@src/services/OrderService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function createOrder(req: Request, res: Response) {
  const input = parseCreateOrderInput(req.body);
  const result = await OrderService.createOrder(authUserId(req), input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function listOrders(req: Request, res: Response) {
  const result = await OrderService.listOrders(authUserId(req));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getOrderById(req: Request, res: Response) {
  const result = await OrderService.getOrderById(
    authUserId(req),
    getRouteParam(req.params.orderId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function cancelOrder(req: Request, res: Response) {
  const result = await OrderService.cancelOrder(
    authUserId(req),
    getRouteParam(req.params.orderId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  createOrder: errorHandle(createOrder),
  listOrders: errorHandle(listOrders),
  getOrderById: errorHandle(getOrderById),
  cancelOrder: errorHandle(cancelOrder),
} as const;
