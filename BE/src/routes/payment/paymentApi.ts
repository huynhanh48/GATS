import { Router } from 'express';

import PaymentPaths from '@src/common/paths/payment';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import paymentHandlers from './paymentRouter';

const apiRouter = Router();
const paymentRouter = Router();

/** Sepay bank-transfer webhook — no user auth; optional API key */
paymentRouter.post(
  PaymentPaths.Payment.SepayWebhook,
  paymentHandlers.sepayWebhook,
);

paymentRouter.get(
  PaymentPaths.Payment.SepayCheck,
  errorHandle(authMiddleware),
  paymentHandlers.sepayCheck,
);

paymentRouter.get(
  PaymentPaths.Payment.VnpayReturn,
  paymentHandlers.vnpayReturn,
);

paymentRouter.get(
  PaymentPaths.Payment.MomoReturn,
  paymentHandlers.momoReturn,
);

apiRouter.use(PaymentPaths.Payment._, paymentRouter);
export default apiRouter;
