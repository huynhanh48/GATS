/** Strip non-alphanumeric for bank/Sepay content matching (same as Ecommerce). */
export function cleanAlnum(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** QR / transfer description: SEVQR + cleaned txnRef */
export function toSepayTransferContent(txnRef: string): string {
  return `SEVQR${cleanAlnum(txnRef)}`;
}

/**
 * Our txnRef shape: ORD + unix ms digits + 6 hex (from randomBytes(3)).
 * Banks often append extra alnum after the memo — do not swallow that into the ref.
 */
const ORD_TXN_REF_IN_CONTENT = /SEVQR(ORD\d+[A-F0-9]{6})/;

/**
 * Extract cleaned txnRef from bank/Sepay content.
 * Expects pattern SEVQR{ORD…} anywhere in the text.
 */
export function extractTxnRefFromContent(
  content: string | undefined | null,
): string | null {
  if (!content) return null;
  const clean = cleanAlnum(content);
  const match = clean.match(ORD_TXN_REF_IN_CONTENT);
  return match?.[1] ?? null;
}

export function contentMatchesTxnRef(
  content: string,
  txnRef: string,
): boolean {
  return cleanAlnum(content).includes(toSepayTransferContent(txnRef));
}
