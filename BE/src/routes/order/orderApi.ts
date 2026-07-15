import { Router } from 'express';

import OrderPaths from '@src/common/paths/order';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
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
