import { createHmac } from 'crypto';

import EnvVars from '@src/common/constants/env';

/** Field order for HMAC (matches SePay PHP docs / reliable signing). */
const SIGNED_FIELD_ORDER = [
  'order_amount',
  'merchant',
  'currency',
  'operation',
  'order_description',
  'order_invoice_number',
  'customer_id',
  'payment_method',
  'success_url',
  'error_url',
  'cancel_url',
] as const;

export type SepayPgEnv = 'production' | 'sandbox';

export type SepayCheckoutFields = {
  merchant: string;
  currency: string;
  operation: string;
  order_amount: string;
  order_invoice_number: string;
  order_description: string;
  payment_method: string;
  customer_id?: string;
  success_url: string;
  error_url: string;
  cancel_url: string;
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

export function getSepayCheckoutInitUrl(): string {
  return getSepayPgEnv() === 'sandbox'
    ? 'https://pay-sandbox.sepay.vn/v1/checkout/init'
    : 'https://pay.sepay.vn/v1/checkout/init';
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

export function signSepayCheckoutFields(
  fields: Record<string, string | undefined>,
  secretKey: string,
): string {
  const parts: string[] = [];
  for (const field of SIGNED_FIELD_ORDER) {
    const value = fields[field];
    if (value === undefined || value === '') continue;
    parts.push(`${field}=${value}`);
  }
  return createHmac('sha256', secretKey).update(parts.join(',')).digest('base64');
}

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
  const merchantId = getSepayMerchantId();
  const secret = getSepaySecretKey();
  if (!merchantId || !secret) {
    throw new Error('SePay merchant credentials are not configured');
  }

  const base: Record<string, string> = {
    order_amount: String(input.amount),
    merchant: merchantId,
    currency: 'VND',
    operation: 'PURCHASE',
    order_description: input.description.slice(0, 255),
    order_invoice_number: input.invoiceNumber,
    payment_method: input.paymentMethod ?? 'BANK_TRANSFER',
    success_url: input.successUrl,
    error_url: input.errorUrl,
    cancel_url: input.cancelUrl,
  };
  if (input.customerId) {
    base.customer_id = input.customerId;
  }

  return {
    ...base,
    signature: signSepayCheckoutFields(base, secret),
  } as SepayCheckoutFields;
}

export type SepayPgOrderDetail = {
  order_invoice_number?: string;
  order_status?: string;
  order_amount?: string | number;
  id?: string;
  order_id?: string;
};

/**
 * Paid / captured statuses returned by SePay PG order detail.
 */
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
