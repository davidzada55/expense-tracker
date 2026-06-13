import { getDifficultyConfig } from "@/lib/difficulty";

export const MONTHLY_BUDGET_WARNING_THRESHOLD = 8_000;
export const MONTHLY_BUDGET_LIMIT = 10_000;

export type BudgetAlertLevel = "none" | "warning" | "critical";

function getAdjustedThresholds() {
  const config = getDifficultyConfig();

  return {
    warning:
      MONTHLY_BUDGET_WARNING_THRESHOLD * config.budgetWarningMultiplier,
    limit: MONTHLY_BUDGET_LIMIT * config.budgetCriticalMultiplier,
  };
}

export function getBudgetAlertLevel(monthlyTotal: number): BudgetAlertLevel {
  const { warning, limit } = getAdjustedThresholds();

  if (monthlyTotal >= limit) {
    return "critical";
  }

  if (monthlyTotal >= warning) {
    return "warning";
  }

  return "none";
}

export function getRemainingBudget(monthlyTotal: number): number {
  const { limit } = getAdjustedThresholds();
  return Math.max(0, limit - monthlyTotal);
}

export function getBudgetOverage(monthlyTotal: number): number {
  const { limit } = getAdjustedThresholds();
  return Math.max(0, monthlyTotal - limit);
}

export function getAdjustedBudgetLimit(): number {
  return getAdjustedThresholds().limit;
}

export function getAdjustedWarningThreshold(): number {
  return getAdjustedThresholds().warning;
}
