import EnvVars from '@src/common/constants/env';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  BankAccount,
  CreateBankAccountInput,
  ListBankAccountsQuery,
  PaymentBankAccount,
  UpdateBankAccountInput,
} from '@src/models/BankAccount.model';
import * as BankAccountRepo from '@src/repos/BankAccountRepo';

const Errors = {
  NOT_FOUND: 'Bank account not found',
  NO_PAYMENT_ACCOUNT:
    'No bank account configured. Add an account in settings or set BANK_ACCOUNT_NUMBER in env.',
} as const;

function toPaymentFromDb(account: BankAccount): PaymentBankAccount {
  return {
    id: account.id,
    source: 'db',
    label: account.label,
    bankName: account.bankName,
    bankCode: account.bankCode,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
    bankBranch: account.bankBranch ?? null,
  };
}

function toPaymentFromEnv(): PaymentBankAccount | null {
  if (!EnvVars.BankAccountNumber) {
    return null;
  }
  return {
    id: null,
    source: 'env',
    label: null,
    bankName: EnvVars.BankName || 'VietinBank',
    bankCode: EnvVars.BankName || 'VietinBank',
    accountNumber: EnvVars.BankAccountNumber,
    accountHolder: EnvVars.BankAccountName ?? null,
    bankBranch: null,
  };
}

/**
 * Prefer active DB default bank account; fall back to env BANK_* vars.
 */
async function resolvePaymentBankAccount(): Promise<PaymentBankAccount> {
  const dbDefault = await BankAccountRepo.findActiveDefault();
  if (dbDefault) {
    return toPaymentFromDb(dbDefault);
  }

  const fromEnv = toPaymentFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  throw new RouteError(
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
    Errors.NO_PAYMENT_ACCOUNT,
  );
}

async function list(query?: ListBankAccountsQuery) {
  const data = await BankAccountRepo.findAll({
    activeOnly: query?.activeOnly,
  });
  return { data };
}

async function getById(id: string): Promise<BankAccount> {
  const account = await BankAccountRepo.findById(id);
  if (!account) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return account;
}

async function create(input: CreateBankAccountInput): Promise<BankAccount> {
  const activeCount = await BankAccountRepo.countActive();
  const makeDefault =
    input.isDefault === true || (input.isActive !== false && activeCount === 0);

  if (makeDefault) {
    await BankAccountRepo.clearDefault();
  }

  return BankAccountRepo.create({
    label: input.label,
    bankName: input.bankName,
    bankCode: input.bankCode ?? input.bankName,
    accountNumber: input.accountNumber,
    accountHolder: input.accountHolder,
    bankBranch: input.bankBranch ?? null,
    isDefault: makeDefault,
    isActive: input.isActive ?? true,
  });
}

async function update(
  id: string,
  input: UpdateBankAccountInput,
): Promise<BankAccount> {
  const existing = await getById(id);

  if (input.isDefault === true) {
    await BankAccountRepo.clearDefault();
  }

  if (
    input.isActive === false &&
    existing.isDefault &&
    input.isDefault !== true
  ) {
    // Deactivating the default: clear default flag so another can be chosen
    // or env fallback is used.
  }

  const payload: Parameters<typeof BankAccountRepo.update>[1] = {};

  if (input.label !== undefined) payload.label = input.label;
  if (input.bankName !== undefined) payload.bankName = input.bankName;
  if (input.bankCode !== undefined) payload.bankCode = input.bankCode;
  if (input.accountNumber !== undefined) {
    payload.accountNumber = input.accountNumber;
  }
  if (input.accountHolder !== undefined) {
    payload.accountHolder = input.accountHolder;
  }
  if (input.bankBranch !== undefined) payload.bankBranch = input.bankBranch;
  if (input.isActive !== undefined) payload.isActive = input.isActive;

  if (input.isDefault === true) {
    payload.isDefault = true;
    payload.isActive = true;
  } else if (input.isDefault === false) {
    payload.isDefault = false;
  } else if (input.isActive === false && existing.isDefault) {
    payload.isDefault = false;
  }

  const updated = await BankAccountRepo.update(id, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return updated;
}

async function setDefault(id: string): Promise<BankAccount> {
  const existing = await getById(id);
  if (!existing.isActive) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Cannot set an inactive bank account as default',
    );
  }

  const updated = await BankAccountRepo.setDefault(id);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return updated;
}

async function remove(id: string) {
  const deleted = await BankAccountRepo.remove(id);
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { message: 'Bank account deleted' };
}

/**
 * Seed one default account from env if none exists (dev convenience).
 */
async function seedFromEnvIfEmpty(): Promise<BankAccount | null> {
  const existing = await BankAccountRepo.findAll();
  if (existing.length > 0) {
    return null;
  }

  const fromEnv = toPaymentFromEnv();
  if (!fromEnv) {
    return null;
  }

  return BankAccountRepo.create({
    label: 'Default (from env)',
    bankName: fromEnv.bankName,
    bankCode: fromEnv.bankCode,
    accountNumber: fromEnv.accountNumber,
    accountHolder: fromEnv.accountHolder ?? fromEnv.accountNumber,
    bankBranch: null,
    isDefault: true,
    isActive: true,
  });
}

export default {
  Errors,
  resolvePaymentBankAccount,
  list,
  getById,
  create,
  update,
  setDefault,
  remove,
  seedFromEnvIfEmpty,
};
