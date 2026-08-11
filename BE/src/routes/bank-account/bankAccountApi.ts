import { Router } from 'express';

import BankAccountPaths from '@src/common/paths/bank-account';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import { errorHandle } from '@src/middleware/errorHandle';
import handlers from './bankAccountRouter';

const apiRouter = Router();
const bankAccountRouter = Router();

bankAccountRouter.get(
  BankAccountPaths.BankAccount.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.list,
);

bankAccountRouter.get(
  BankAccountPaths.BankAccount.ExportCsv,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.exportCsv,
);

bankAccountRouter.get(
  BankAccountPaths.BankAccount.Get,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.getById,
);

bankAccountRouter.post(
  BankAccountPaths.BankAccount.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.create,
);

bankAccountRouter.patch(
  BankAccountPaths.BankAccount.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.update,
);

bankAccountRouter.post(
  BankAccountPaths.BankAccount.SetDefault,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.setDefault,
);

bankAccountRouter.delete(
  BankAccountPaths.BankAccount.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  handlers.remove,
);

apiRouter.use(BankAccountPaths.BankAccount._, bankAccountRouter);
export default apiRouter;
