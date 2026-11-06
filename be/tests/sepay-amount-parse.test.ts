import { describe, expect, it } from 'vitest';

/**
 * Mirrors PaymentService.resolvePaidAmount — keep in sync when changing parse rules.
 * VN thousand dots ("2.000") must NOT become Number("2.000") === 2.
 */
function resolvePaidAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    return Math.round(Number(trimmed.replace(/\./g, '')));
  }

  if (trimmed.includes(',') && trimmed.includes('.')) {
    const lastComma = trimmed.lastIndexOf(',');
    const lastDot = trimmed.lastIndexOf('.');
    if (lastComma > lastDot) {
      const normalized = trimmed.replace(/\./g, '').replace(',', '.');
      const n = Number(normalized);
      return Number.isFinite(n) ? Math.round(n) : 0;
    }
    const normalized = trimmed.replace(/,/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }

  if (/^\d{1,3}(,\d{3})+$/.test(trimmed)) {
    return Math.round(Number(trimmed.replace(/,/g, '')));
  }

  const cleaned = trimmed.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

describe('resolvePaidAmount (SePay amount parse)', () => {
  it('parses plain numbers', () => {
    expect(resolvePaidAmount(2000)).toBe(2000);
    expect(resolvePaidAmount(2000.4)).toBe(2000);
  });

  it('parses VN thousand-dot strings without treating them as decimals', () => {
    expect(resolvePaidAmount('2.000')).toBe(2000);
    expect(resolvePaidAmount('500.000')).toBe(500000);
    expect(resolvePaidAmount('1.500.000')).toBe(1500000);
  });

  it('parses plain digit strings', () => {
    expect(resolvePaidAmount('2000')).toBe(2000);
    expect(resolvePaidAmount('500000')).toBe(500000);
  });

  it('does not break true decimals', () => {
    expect(resolvePaidAmount('2000.50')).toBe(2001);
    expect(resolvePaidAmount('99.9')).toBe(100);
  });
});
