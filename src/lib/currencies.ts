export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", locale: "en-CA" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "AU$", locale: "en-AU" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
};

export const DEFAULT_CURRENCY = "USD";

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = DEFAULT_CURRENCY
): string {
  const val = amount || 0;
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      maximumFractionDigits: config.code === "JPY" ? 0 : 2,
      minimumFractionDigits: config.code === "JPY" ? 0 : 2,
    }).format(val);
  } catch {
    return `${config.symbol}${val.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || "$";
}
