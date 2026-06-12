import type { ExpenseCategory } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const categoryLabels: Record<ExpenseCategory, string> = {
  food: "אוכל",
  transport: "תחבורה",
  housing: "דיור",
  health: "בריאות",
  entertainment: "בילויים",
  investments: "השקעות",
  other: "אחר",
};

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCategory(category: ExpenseCategory): string {
  return categoryLabels[category];
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}
