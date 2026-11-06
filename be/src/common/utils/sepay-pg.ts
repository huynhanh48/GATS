import EnvVars from '@src/common/constants/env';
import { SePayPgClient } from 'sepay-pg-node';

export type SepayPgEnv = 'production' | 'sandbox';

export type SepayCheckoutFields = Record<string, string> & {
  merchant: string;
  signature: string;
};

export function getSepayPgEnv(): SepayPgEnv {
  const raw = (EnvVars.SepayPgEnv || 'production').toLowerCase();
  return raw === 'sandbox' ? 'sandbox' : 'production';
}

export function getSepayMerchantId(): string | undefined {
  return EnvVars.SepayMerchantId?.trim() || undefined;
}

export function getSepaySecretKey(): string | undefined {
  return EnvVars.SepaySecretKey?.trim() || undefined;
}

export function isSepayPgConfigured(): boolean {
  return Boolean(getSepayMerchantId() && getSepaySecretKey());
}

function createSepayClient(): SePayPgClient {
  const merchantId = getSepayMerchantId();
  const secret = getSepaySecretKey();
  if (!merchantId || !secret) {
    throw new Error('SePay merchant credentials are not configured');
  }
  return new SePayPgClient({
    env: getSepayPgEnv(),
    merchant_id: merchantId,
    secret_key: secret,
  });
}

export function getSepayCheckoutInitUrl(): string {
  return createSepayClient().checkout.initCheckoutUrl();
}

export function getSepayPgApiBase(): string {
  return getSepayPgEnv() === 'sandbox'
    ? 'https://pgapi-sandbox.sepay.vn/v1'
    : 'https://pgapi.sepay.vn/v1';
}

export function buildSepayBasicAuthHeader(): string {
  const merchantId = getSepayMerchantId();
  const secret = getSepaySecretKey();
  if (!merchantId || !secret) {
    throw new Error('SePay merchant credentials are not configured');
  }
  const token = Buffer.from(`${merchantId}:${secret}`, 'utf8').toString(
    'base64',
  );
  return `Basic ${token}`;
}

/** SePay signs with comma-joined fields — strip commas / control chars. */
export function sanitizeSepayDescription(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s._\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

/**
 * Build hosted-checkout fields using official sepay-pg-node signing.
 * Do not reimplement HMAC — SePay rejects mismatched signature as "invalid request".
 */
export function buildSepayCheckoutFields(input: {
  invoiceNumber: string;
  amount: number;
  description: string;
  customerId?: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CARD' | 'NAPAS_BANK_TRANSFER';
}): SepayCheckoutFields {
  const client = createSepayClient();
  const description = sanitizeSepayDescription(
    input.description || 'GATS Academy',
  );

  const fields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    // Omit payment_method so SePay shows methods enabled for this merchant.
    ...(input.paymentMethod
      ? {
          payment_method:
            input.paymentMethod === 'CARD'
              ? undefined
              : input.paymentMethod,
        }
      : {}),
    order_invoice_number: input.invoiceNumber,
    order_amount: input.amount,
    currency: 'VND',
    order_description: description,
    ...(input.customerId ? { customer_id: String(input.customerId) } : {}),
    success_url: input.successUrl,
    error_url: input.errorUrl,
    cancel_url: input.cancelUrl,
  });

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    normalized[key] = String(value);
  }
  return normalized as SepayCheckoutFields;
}

export type SepayPgOrderDetail = {
  order_invoice_number?: string;
  order_status?: string;
  order_amount?: string | number;
  id?: string;
  order_id?: string;
};

export function isSepayPgOrderPaid(status: string | undefined | null): boolean {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return (
    normalized === 'CAPTURED' ||
    normalized === 'COMPLETED' ||
    normalized === 'PAID' ||
    normalized === 'SUCCESS' ||
    normalized === 'APPROVED'
  );
}
