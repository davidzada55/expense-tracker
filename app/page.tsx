import { Suspense } from "react";

import { getExpenses } from "@/app/actions/expenses";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { MonthlySummary } from "@/components/MonthlySummary";
import { filterExpensesForCurrentMonth } from "@/lib/expenses";

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

  return (
    <>
      <MonthlySummary
        status={getSummaryStatus(result)}
        expenses={expenses}
        error={errorMessage}
      />
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
      <ExpenseList status="loading" />
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
            כספים אישיים
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
            מעקב הוצאות
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            עקבו אחר ההוצאות לפי קטגוריה וקבלו תמונת מצב חודשית במבט אחד.
          </p>
        </header>

        <div className="space-y-8">
          <ExpenseForm />

          <Suspense fallback={<ExpenseSectionsFallback />}>
            <ExpenseSections />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
