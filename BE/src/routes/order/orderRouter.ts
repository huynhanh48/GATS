import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseAdminExceptionListQuery,
  parseAdminExportOrdersQuery,
  parseAdminOrderListQuery,
  parseAdminResolveException,
  parseAdminUpdateOrderStatus,
  parseCreateOrderInput,
} from '@src/models/Order.model';
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

async function adminListOrders(req: Request, res: Response) {
  const query = parseAdminOrderListQuery(req.query);
  const result = await OrderService.adminListOrders(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminGetOrder(req: Request, res: Response) {
  const result = await OrderService.adminGetOrder(
    getRouteParam(req.params.orderId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminUpdateOrderStatus(req: Request, res: Response) {
  const input = parseAdminUpdateOrderStatus(req.body);
  const result = await OrderService.adminUpdateOrderStatus(
    getRouteParam(req.params.orderId),
    input,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminRepairEnrollment(req: Request, res: Response) {
  const reason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : undefined;
  const result = await OrderService.adminRepairEnrollment(
    getRouteParam(req.params.orderId),
    authUserId(req),
    reason,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminExpireStalePending(req: Request, res: Response) {
  const result = await OrderService.adminExpireStalePending(authUserId(req));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminListExceptions(req: Request, res: Response) {
  const query = parseAdminExceptionListQuery(req.query);
  const result = await OrderService.adminListExceptions(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminResolveException(req: Request, res: Response) {
  const input = parseAdminResolveException(req.body);
  const result = await OrderService.adminResolveException(
    getRouteParam(req.params.exceptionId),
    authUserId(req),
    input.note,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminExportOrdersCsv(req: Request, res: Response) {
  const query = parseAdminExportOrdersQuery(req.query);
  const { csv, filename } = await OrderService.adminExportOrdersCsv(query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(HttpStatusCodes.OK).send(csv);
}

export default {
  createOrder: errorHandle(createOrder),
  listOrders: errorHandle(listOrders),
  getOrderById: errorHandle(getOrderById),
  cancelOrder: errorHandle(cancelOrder),
  adminListOrders: errorHandle(adminListOrders),
  adminGetOrder: errorHandle(adminGetOrder),
  adminUpdateOrderStatus: errorHandle(adminUpdateOrderStatus),
  adminRepairEnrollment: errorHandle(adminRepairEnrollment),
  adminExpireStalePending: errorHandle(adminExpireStalePending),
  adminListExceptions: errorHandle(adminListExceptions),
  adminResolveException: errorHandle(adminResolveException),
  adminExportOrdersCsv: errorHandle(adminExportOrdersCsv),
} as const;
