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
        className="flex gap-4 items-start bg-red-500/20 border border-red-500/30 text-red-200 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/20"
      >
        <svg
          className="h-6 w-6 shrink-0 text-red-300 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <p className="font-bold text-white">חריגה מתקציב חודשי</p>
          <p className="mt-1 text-sm leading-relaxed text-red-200/90">
            סך ההוצאות החודש ({formatCurrency(monthlyTotal)}) עלה על תקרת{" "}
            {formatCurrency(MONTHLY_BUDGET_LIMIT)}. חריגה של{" "}
            {formatCurrency(overage)}.
          </p>
        </div>
      </div>
    );
  }

  const remaining = getRemainingBudget(monthlyTotal);

  return (
    <div
      role="alert"
      className="flex gap-4 items-start bg-amber-500/20 border border-amber-500/30 text-amber-200 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/20"
    >
      <svg
        className="h-6 w-6 shrink-0 text-amber-300 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div>
        <p className="font-bold text-white">התראה מקדימה</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-200/90">
          הגעתם ל-{formatCurrency(monthlyTotal)} מתוך{" "}
          {formatCurrency(MONTHLY_BUDGET_LIMIT)}. נותרו{" "}
          {formatCurrency(remaining)} עד תקרת ההוצאה החודשית (התראה מקדימה ב-
          {formatCurrency(MONTHLY_BUDGET_WARNING_THRESHOLD)}).
        </p>
      </div>
    </div>
  );
}
