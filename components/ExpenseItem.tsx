"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteExpense } from "@/app/actions/expenses";
import { formatCategory, formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

type ExpenseItemProps = {
  expense: Expense;
};

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteExpense(expense.id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-stone-900">
              {formatCurrency(expense.amount)}
            </p>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
              {formatCategory(expense.category)}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {formatDate(expense.date)}
          </p>
          {expense.note ? (
            <p className="mt-2 text-sm text-stone-700">{expense.note}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`מחק הוצאה בקטגוריה ${formatCategory(expense.category)}`}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "..." : "מחק"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </li>
  );
}
