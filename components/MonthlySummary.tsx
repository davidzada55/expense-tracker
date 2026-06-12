"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  filterExpensesForCurrentMonth,
  filterExpensesForPreviousMonth,
  getCategoryTotals,
  getMonthlyTotal,
} from "@/lib/expenses";
import { expenseCategories } from "@/lib/schemas";
import { formatCategory, formatCurrency, getCurrentMonthLabel } from "@/lib/format";
import { BudgetAlert } from "@/components/BudgetAlert";
import type { Expense } from "@/lib/types";

type MonthlySummaryStatus = "loading" | "empty" | "error" | "success";

type MonthlySummaryProps = {
  status: MonthlySummaryStatus;
  expenses?: Expense[];
  error?: string;
};

function LoadingState() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-stone-100"
          />
        ))}
      </div>
      <p className="text-sm text-stone-500">טוען סיכום חודשי...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
      <p className="font-medium text-stone-900">אין הוצאות החודש</p>
      <p className="mt-2 text-sm text-stone-500">
        הוצאות שתוסיפו ל{getCurrentMonthLabel()} יופיעו כאן.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-5 py-4"
    >
      <p className="font-medium text-red-800">לא ניתן לטעון את הסיכום החודשי</p>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        נסה שוב
      </button>
    </div>
  );
}

export function MonthlySummary({
  status,
  expenses = [],
  error,
}: MonthlySummaryProps) {
  const router = useRouter();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthExpenses = filterExpensesForCurrentMonth(expenses);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const monthlyTotal = getMonthlyTotal(monthExpenses);
  const categoriesWithSpending = expenseCategories.filter(
    (category) => categoryTotals[category] > 0,
  );
  const hasMonthlyData =
    status === "success" && categoriesWithSpending.length > 0;
  const showBudgetTracking = status === "success" && monthExpenses.length > 0;

  async function handleGenerateSummary() {
    setAiError(null);
    setAiSummary(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenses: monthExpenses,
          previousMonthExpenses: filterExpensesForPreviousMonth(expenses),
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "יצירת הסיכום נכשלה.";
        setAiError(errorMessage);
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("summary" in data) ||
        typeof data.summary !== "string" ||
        data.summary.trim().length === 0
      ) {
        setAiError("תשובת הסיכום לא תקינה.");
        return;
      }

      setAiSummary(data.summary.trim());
    } catch {
      setAiError("יצירת הסיכום נכשלה. בדקו את החיבור ונסו שוב.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section
      aria-labelledby="monthly-summary-heading"
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="monthly-summary-heading"
            className="text-lg font-semibold text-stone-900"
          >
            סיכום חודשי
          </h2>
          <p className="mt-1 text-sm text-stone-500">{getCurrentMonthLabel()}</p>
        </div>

        {hasMonthlyData ? (
          <p className="text-sm font-medium text-stone-700">
            סה״כ:{" "}
            <span className="text-base font-semibold text-stone-900">
              {formatCurrency(monthlyTotal)}
            </span>
          </p>
        ) : null}
      </div>

      {showBudgetTracking ? <BudgetAlert monthlyTotal={monthlyTotal} /> : null}

      {status === "loading" ? <LoadingState /> : null}

      {status === "error" ? (
        <ErrorState
          message={error ?? "משהו השתבש בעת טעינת נתוני הסיכום."}
          onRetry={() => router.refresh()}
        />
      ) : null}

      {status === "empty" ? <EmptyState /> : null}

      {status === "success" && categoriesWithSpending.length === 0 ? (
        <EmptyState />
      ) : null}

      {hasMonthlyData ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {categoriesWithSpending.map((category) => (
              <li
                key={category}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-stone-700">
                  {formatCategory(category)}
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  {formatCurrency(categoryTotals[category])}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-stone-200 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  תובנות AI
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  קבלו סיכום קצר בשפה טבעית על ההוצאות החודש.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isGenerating ? "מנתח הוצאות..." : "צור סיכום"}
              </button>
            </div>

            {isGenerating ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-sm text-stone-600"
              >
                מנתח את ההוצאות שלך...
              </p>
            ) : null}

            {aiError ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm text-red-700">{aiError}</p>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  נסה שוב
                </button>
              </div>
            ) : null}

            {aiSummary ? (
              <div
                role="status"
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
              >
                <p className="text-sm leading-6 text-emerald-900">{aiSummary}</p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
