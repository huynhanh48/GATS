import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateBankAccountInput,
  parseListBankAccountsQuery,
  parseUpdateBankAccountInput,
} from '@src/models/BankAccount.model';
import BankAccountService from '@src/services/BankAccountService';

async function list(req: Request, res: Response) {
  const query = parseListBankAccountsQuery(req.query);
  const result = await BankAccountService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getById(req: Request, res: Response) {
  const account = await BankAccountService.getById(
    getRouteParam(req.params.bankAccountId),
  );
  return res.status(HttpStatusCodes.OK).json({ bankAccount: account });
}

async function create(req: Request, res: Response) {
  const input = parseCreateBankAccountInput(req.body);
  const bankAccount = await BankAccountService.create(input);
  return res.status(HttpStatusCodes.CREATED).json({ bankAccount });
}

async function update(req: Request, res: Response) {
  const input = parseUpdateBankAccountInput(req.body);
  const bankAccount = await BankAccountService.update(
    getRouteParam(req.params.bankAccountId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json({ bankAccount });
}

async function setDefault(req: Request, res: Response) {
  const bankAccount = await BankAccountService.setDefault(
    getRouteParam(req.params.bankAccountId),
  );
  return res.status(HttpStatusCodes.OK).json({ bankAccount });
}

async function remove(req: Request, res: Response) {
  const result = await BankAccountService.remove(
    getRouteParam(req.params.bankAccountId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  list: errorHandle(list),
  getById: errorHandle(getById),
  create: errorHandle(create),
  update: errorHandle(update),
  setDefault: errorHandle(setDefault),
  remove: errorHandle(remove),
} as const;
