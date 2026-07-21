// =============================================================================
// MONEY FORMATTER — Currency-aware formatting
// =============================================================================

const CURRENCY_CONFIG: Record<string, { locale: string; currency: string }> = {
  INR: { locale: 'en-IN', currency: 'INR' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  AED: { locale: 'ar-AE', currency: 'AED' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
};

/**
 * Format a numeric amount into a localized currency string.
 *
 * @example formatMoney(12500000, 'INR') → "₹1,25,00,000.00"
 * @example formatMoney(4999.99, 'USD')  → "$4,999.99"
 */
export function formatMoney(amount: number, currencyCode: string = 'USD'): string {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a compact currency string for display in tight spaces.
 *
 * @example formatMoneyCompact(1250000, 'INR') → "₹12.5L"
 * @example formatMoneyCompact(4999, 'USD')    → "$5K"
 */
export function formatMoneyCompact(amount: number, currencyCode: string = 'USD'): string {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}
