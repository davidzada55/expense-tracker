export const MONTHLY_BUDGET_WARNING_THRESHOLD = 8_000;
export const MONTHLY_BUDGET_LIMIT = 10_000;

export type BudgetAlertLevel = "none" | "warning" | "critical";

export function getBudgetAlertLevel(monthlyTotal: number): BudgetAlertLevel {
  if (monthlyTotal >= MONTHLY_BUDGET_LIMIT) {
    return "critical";
  }

  if (monthlyTotal >= MONTHLY_BUDGET_WARNING_THRESHOLD) {
    return "warning";
  }

  return "none";
}

export function getRemainingBudget(monthlyTotal: number): number {
  return Math.max(0, MONTHLY_BUDGET_LIMIT - monthlyTotal);
}

export function getBudgetOverage(monthlyTotal: number): number {
  return Math.max(0, monthlyTotal - MONTHLY_BUDGET_LIMIT);
}
