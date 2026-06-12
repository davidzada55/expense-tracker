import Link from "next/link";

import { getExpenses } from "@/app/actions/expenses";
import { getAlerts } from "@/app/actions/alerts";
import { getStocks } from "@/app/actions/stocks";
import { StocksPageClient } from "@/components/stocks/StocksPageClient";
import { filterExpensesForCurrentMonth } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
  const [stocksResult, alertsResult, expensesResult] = await Promise.all([
    getStocks(),
    getAlerts(),
    getExpenses(),
  ]);

  const stocks = stocksResult.success ? stocksResult.data : [];
  const alerts = alertsResult.success ? alertsResult.data : [];
  const monthlyExpenses =
    expensesResult.success
      ? filterExpensesForCurrentMonth(expensesResult.data)
      : [];

  const error =
    !stocksResult.success
      ? stocksResult.error
      : !alertsResult.success
        ? alertsResult.error
        : !expensesResult.success
          ? expensesResult.error
          : undefined;

  return (
    <main className="min-h-screen w-full px-4 py-8 md:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            תיק מניות 📈
          </h1>
          <p className="mt-1 text-sm text-white/60">
            עקבו אחר המניות שלכם, רווח והפסד, והתראות מחיר.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-white/70 transition-colors hover:text-white"
        >
          ← חזרה להוצאות
        </Link>
      </header>

      <StocksPageClient
        stocks={stocks}
        alerts={alerts}
        monthlyExpenses={monthlyExpenses}
        error={error}
      />
    </main>
  );
}
