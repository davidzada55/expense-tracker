"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteExpense } from "@/app/actions/expenses";
import { formatCategory, formatCurrency, formatDate } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";

type ExpenseItemProps = {
  expense: Expense;
};

const categoryColors: Record<ExpenseCategory, string> = {
  food: "bg-[#acc07d]/15 text-[#acc07d] border border-[#acc07d]/20 text-xs font-medium px-2.5 py-1 rounded-full",
  transport: "bg-[#dfb15b]/15 text-[#dfb15b] border border-[#dfb15b]/20 text-xs font-medium px-2.5 py-1 rounded-full",
  housing: "bg-[#cdaa57]/15 text-[#cdaa57] border border-[#cdaa57]/20 text-xs font-medium px-2.5 py-1 rounded-full",
  health: "bg-[#e8daab]/15 text-[#e8daab] border border-[#e8daab]/20 text-xs font-medium px-2.5 py-1 rounded-full",
  entertainment: "bg-[#b8903c]/15 text-[#b8903c] border border-[#b8903c]/20 text-xs font-medium px-2.5 py-1 rounded-full",
  investments: "bg-[#5e684f]/15 text-[#acc07d] border border-[#5e684f]/30 text-xs font-medium px-2.5 py-1 rounded-full",
  other: "bg-white/5 text-white/70 border border-white/10 text-xs font-medium px-2.5 py-1 rounded-full",
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
    <li className="flex items-center justify-between gap-4 border-b border-white/5 last:border-0 px-6 py-4 hover:bg-white/5 transition-colors duration-150 min-h-[56px] last:rounded-b-2xl">
      {/* Right side: Category Badge + Note */}
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 ${categoryColors[expense.category]}`}>
          {formatCategory(expense.category)}
        </span>
        {expense.note ? (
          <p className="text-sm text-white/90 truncate max-w-[180px] sm:max-w-md" title={expense.note}>
            {expense.note}
          </p>
        ) : null}
      </div>

      {/* Left side: Amount + Date + Delete Button */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-left">
          <p className="text-base font-bold text-white">
            {formatCurrency(expense.amount)}
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            {formatDate(expense.date)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`מחק הוצאה בקטגוריה ${formatCategory(expense.category)}`}
          className="text-white/40 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
        >
          {isPending ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>

      {error ? (
        <p role="alert" className="absolute bottom-1 left-6 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </li>
  );
}
