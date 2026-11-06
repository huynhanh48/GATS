/** Strip non-alphanumeric for bank/Sepay content matching (same as Ecommerce). */
export function cleanAlnum(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** QR / transfer description: SEVQR + cleaned txnRef */
export function toSepayTransferContent(txnRef: string): string {
  return `SEVQR${cleanAlnum(txnRef)}`;
}

/**
 * Our txnRef shape: ORD + unix ms digits + 6 hex (randomBytes(3)).
 * Prefer 13-digit ms (current Date.now()); then 12 / 14 for edge clocks.
 * Fixed digit width avoids greedy `\d+` backtracking into hex or bank suffix.
 */
const ORD_MS_WIDTHS = [13, 12, 14] as const;

/**
 * Extract cleaned txnRef from bank/Sepay content.
 * Accepts optional SEVQR prefix (VietinBank memos often drop it).
 */
export function extractTxnRefFromContent(
  content: string | undefined | null,
): string | null {
  if (!content) return null;
  const clean = cleanAlnum(content);

  for (const width of ORD_MS_WIDTHS) {
    const re = new RegExp(`(?:SEVQR)?(ORD\\d{${width}}[A-F0-9]{6})`);
    const match = clean.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function contentMatchesTxnRef(
  content: string,
  txnRef: string,
): boolean {
  const clean = cleanAlnum(content);
  const ref = cleanAlnum(txnRef);
  return clean.includes(`SEVQR${ref}`) || clean.includes(ref);
}
