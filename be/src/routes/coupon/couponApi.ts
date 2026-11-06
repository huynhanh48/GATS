import { Router } from 'express';

import CouponPaths from '@src/common/paths/coupon';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import couponHandlers from './couponRouter';

const apiRouter = Router();
const couponRouter = Router();

couponRouter.post(
  CouponPaths.Coupon.Preview,
  errorHandle(authMiddleware),
  couponHandlers.preview,
);

couponRouter.get(
  CouponPaths.Coupon.List,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  couponHandlers.list,
);

couponRouter.post(
  CouponPaths.Coupon.Create,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  couponHandlers.create,
);

couponRouter.get(
  CouponPaths.Coupon.Get,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  couponHandlers.getById,
);

couponRouter.patch(
  CouponPaths.Coupon.Update,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  couponHandlers.update,
);

couponRouter.delete(
  CouponPaths.Coupon.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  couponHandlers.remove,
);

apiRouter.use(CouponPaths.Coupon._, couponRouter);
export default apiRouter;
