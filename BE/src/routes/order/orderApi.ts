import { Router } from 'express';

import OrderPaths from '@src/common/paths/order';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import orderHandlers from './orderRouter';

const apiRouter = Router();
const orderRouter = Router();

orderRouter.post(
  OrderPaths.Order.Create,
  errorHandle(authMiddleware),
  orderHandlers.createOrder,
);

orderRouter.get(
  OrderPaths.Order.List,
  errorHandle(authMiddleware),
  orderHandlers.listOrders,
);

/** Staff admin routes — must be registered before `/:orderId` */
orderRouter.get(
  OrderPaths.Order.AdminList,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminListOrders,
);

orderRouter.post(
  OrderPaths.Order.AdminExpireStale,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminExpireStalePending,
);

/** Must be registered before `/admin/:orderId` (literal paths, same method) */
orderRouter.get(
  OrderPaths.Order.AdminExportCsv,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminExportOrdersCsv,
);

orderRouter.get(
  OrderPaths.Order.AdminExceptions,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminListExceptions,
);

orderRouter.post(
  OrderPaths.Order.AdminExceptionResolve,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminResolveException,
);

orderRouter.get(
  OrderPaths.Order.AdminGet,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminGetOrder,
);

orderRouter.patch(
  OrderPaths.Order.AdminUpdateStatus,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminUpdateOrderStatus,
);

orderRouter.post(
  OrderPaths.Order.AdminRepairEnrollment,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  orderHandlers.adminRepairEnrollment,
);

orderRouter.get(
  OrderPaths.Order.Get,
  errorHandle(authMiddleware),
  orderHandlers.getOrderById,
);

orderRouter.post(
  OrderPaths.Order.Cancel,
  errorHandle(authMiddleware),
  orderHandlers.cancelOrder,
);

apiRouter.use(OrderPaths.Order._, orderRouter);
export default apiRouter;
