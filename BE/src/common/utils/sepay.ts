/** Strip non-alphanumeric for bank/Sepay content matching (same as Ecommerce). */
export function cleanAlnum(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** QR / transfer description: SEVQR + cleaned txnRef */
export function toSepayTransferContent(txnRef: string): string {
  return `SEVQR${cleanAlnum(txnRef)}`;
}

/**
 * Extract cleaned txnRef from bank/Sepay content.
 * Expects pattern SEVQR{txnRefClean} anywhere in the text.
 */
export function extractTxnRefFromContent(
  content: string | undefined | null,
): string | null {
  if (!content) return null;
  const clean = cleanAlnum(content);
  const match = clean.match(/SEVQR([A-Z0-9]+)/);
  return match?.[1] ?? null;
}

export function contentMatchesTxnRef(
  content: string,
  txnRef: string,
): boolean {
  return cleanAlnum(content).includes(toSepayTransferContent(txnRef));
}
