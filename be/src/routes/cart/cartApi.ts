import { Router } from 'express';

import CartPaths from '@src/common/paths/cart';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import cartHandlers from './cartRouter';

const apiRouter = Router();
const cartRouter = Router();

cartRouter.get(
  CartPaths.Cart.List,
  errorHandle(authMiddleware),
  cartHandlers.getCart,
);

cartRouter.post(
  CartPaths.Cart.Add,
  errorHandle(authMiddleware),
  cartHandlers.addItem,
);

cartRouter.put(
  CartPaths.Cart.Items.Update,
  errorHandle(authMiddleware),
  cartHandlers.changeQuantity,
);

cartRouter.delete(
  CartPaths.Cart.Items.Delete,
  errorHandle(authMiddleware),
  cartHandlers.removeItem,
);

cartRouter.delete(
  CartPaths.Cart.Clear,
  errorHandle(authMiddleware),
  cartHandlers.clearCart,
);

apiRouter.use(CartPaths.Cart._, cartRouter);
export default apiRouter;
