import { Suspense } from "react";

import { getExpenses } from "@/app/actions/expenses";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { MonthlySummary } from "@/components/MonthlySummary";
import { BudgetAlert } from "@/components/BudgetAlert";
import { filterExpensesForCurrentMonth, getMonthlyTotal } from "@/lib/expenses";
import { getCurrentMonthLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

function getListStatus(
  result: Awaited<ReturnType<typeof getExpenses>>,
): "empty" | "error" | "success" {
  if (!result.success) {
    return "error";
  }

  if (result.data.length === 0) {
    return "empty";
  }

  return "success";
}

function getSummaryStatus(
  result: Awaited<ReturnType<typeof getExpenses>>,
): "empty" | "error" | "success" {
  if (!result.success) {
    return "error";
  }

  if (filterExpensesForCurrentMonth(result.data).length === 0) {
    return "empty";
  }

  return "success";
}

async function ExpenseSections() {
  const result = await getExpenses();
  const expenses = result.success ? result.data : [];
  const errorMessage = result.success ? undefined : result.error;

  const monthExpenses = filterExpensesForCurrentMonth(expenses);
  const monthlyTotal = getMonthlyTotal(monthExpenses);
  const showBudgetTracking = result.success && monthExpenses.length > 0;

  return (
    <>
      {showBudgetTracking ? <BudgetAlert monthlyTotal={monthlyTotal} /> : null}
      <MonthlySummary
        status={getSummaryStatus(result)}
        expenses={expenses}
        error={errorMessage}
      />
      <ExpenseForm />
      <ExpenseList
        status={getListStatus(result)}
        expenses={expenses}
        error={errorMessage}
      />
    </>
  );
}

function ExpenseSectionsFallback() {
  return (
    <>
      <MonthlySummary status="loading" />
      <ExpenseForm />
      <ExpenseList status="loading" />
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen w-full px-4 py-8 md:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-olive-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            מעקב הוצאות
          </h1>
          <p className="mt-1 text-sm text-white/60">
            עקבו אחר ההוצאות לפי קטגוריה וקבלו תמונת מצב חודשית במבט אחד.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="text-xl font-bold text-olive-300 border-b border-olive-400/30 pb-0.5">
            {getCurrentMonthLabel()}
          </div>
          <a
            href="/stocks"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            תיק מניות 📈
          </a>
        </div>
      </header>

      <Suspense fallback={<ExpenseSectionsFallback />}>
        <ExpenseSections />
      </Suspense>
    </main>
  );
}
