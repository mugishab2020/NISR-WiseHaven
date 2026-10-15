// ============================================================
// WiseHaven — Currency Formatting Utilities
// All amounts are integer RWF. Never use floating-point for
// financial calculations.
// ============================================================

/**
 * Formats a RWF integer amount with thousand separators.
 * e.g. 250000 → "250,000"
 */
export function formatRWF(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

/**
 * Formats a RWF amount with the currency suffix.
 * e.g. 250000 → "250,000 RWF"
 */
export function formatRWFWithUnit(amount: number): string {
  return `${formatRWF(amount)} RWF`;
}

/**
 * Parses a user-entered string to an integer RWF amount.
 * Strips commas and spaces, returns NaN for invalid input.
 */
export function parseRWF(input: string): number {
  const cleaned = input.replace(/[,\s]/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? NaN : parsed;
}

/**
 * Returns a percentage string rounded to 1 decimal place.
 * e.g. 0.641 → "64.1%"
 */
export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/**
 * Calculates what percentage `part` is of `total`.
 * Returns 0 if total is 0.
 */
export function calcPercent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10; // one decimal
}
