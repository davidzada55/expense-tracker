export type Currency = "ILS" | "USD";

const CURRENCY_STORAGE_KEY = "app-currency";

export function getCurrency(): Currency {
  if (typeof window === "undefined") {
    return "ILS";
  }

  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return stored === "USD" ? "USD" : "ILS";
}

export function saveCurrency(currency: Currency): void {
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === "ILS" ? "₪" : "$";
}

export function formatGoalCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
