import {
  getBudgetAlertLevel,
  getBudgetOverage,
  getRemainingBudget,
  MONTHLY_BUDGET_LIMIT,
  MONTHLY_BUDGET_WARNING_THRESHOLD,
} from "@/lib/budget-alerts";
import { formatCurrency } from "@/lib/format";

type BudgetAlertProps = {
  monthlyTotal: number;
};

export function BudgetAlert({ monthlyTotal }: BudgetAlertProps) {
  const level = getBudgetAlertLevel(monthlyTotal);

  if (level === "none") {
    return null;
  }

  if (level === "critical") {
    const overage = getBudgetOverage(monthlyTotal);

    return (
      <div
        role="alert"
        className="mb-6 rounded-xl border border-red-300 bg-red-50 px-5 py-4"
      >
        <p className="font-semibold text-red-900">חריגה מתקציב חודשי</p>
        <p className="mt-2 text-sm leading-6 text-red-800">
          סך ההוצאות החודש ({formatCurrency(monthlyTotal)}) עלה על תקרת{" "}
          {formatCurrency(MONTHLY_BUDGET_LIMIT)}. חריגה של{" "}
          {formatCurrency(overage)}.
        </p>
      </div>
    );
  }

  const remaining = getRemainingBudget(monthlyTotal);

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4"
    >
      <p className="font-semibold text-amber-900">התראה מקדימה</p>
      <p className="mt-2 text-sm leading-6 text-amber-800">
        הגעתם ל-{formatCurrency(monthlyTotal)} מתוך{" "}
        {formatCurrency(MONTHLY_BUDGET_LIMIT)}. נותרו{" "}
        {formatCurrency(remaining)} עד תקרת ההוצאה החודשית (התראה מקדימה ב-
        {formatCurrency(MONTHLY_BUDGET_WARNING_THRESHOLD)}).
      </p>
    </div>
  );
}
