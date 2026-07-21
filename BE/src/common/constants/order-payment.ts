/** Pending bank-transfer / QR orders expire after this duration. */
export const ORDER_PAYMENT_TTL_MS = 30 * 60 * 1000;

export function getOrderPaymentExpiresAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + ORDER_PAYMENT_TTL_MS);
}

export function isOrderPaymentExpired(
  createdAt: Date,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= createdAt.getTime() + ORDER_PAYMENT_TTL_MS;
}
