"use client";

import { useRouter } from "next/navigation";

import { ExpenseItem } from "@/components/ExpenseItem";
import type { Expense } from "@/lib/types";

type ExpenseListStatus = "loading" | "empty" | "error" | "success";

type ExpenseListProps = {
  status: ExpenseListStatus;
  expenses?: Expense[];
  error?: string;
};

function LoadingState() {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-xl border border-olive-700/40 bg-white/5"
        />
      ))}
      <p className="text-sm text-white/50">טוען את ההוצאות שלך...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-olive-700/40 bg-white/5 px-6 py-10 text-center">
      <p className="text-base font-medium text-white">אין הוצאות עדיין</p>
      <p className="mt-2 text-sm text-white/60">
        הוסיפו את ההוצאה הראשונה למעלה כדי להתחיל לעקוב.
      </p>
      <a
        href="#add-expense"
        className="mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-olive-950 font-bold px-6 text-sm transition-all duration-200 shadow-md shadow-gold-500/10"
      >
        הוסף הוצאה
      </a>
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
      className="rounded-2xl border border-red-500/30 bg-red-500/20 px-6 py-5"
    >
      <p className="font-medium text-red-200">לא ניתן לטעון את ההוצאות</p>
      <p className="mt-2 text-sm text-red-300/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
      >
        נסה שוב
      </button>
    </div>
  );
}

export function ExpenseList({ status, expenses = [], error }: ExpenseListProps) {
  const router = useRouter();

  return (
    <section
      aria-labelledby="expense-list-heading"
      className="bg-[#12160e]/80 backdrop-blur-md border border-olive-700/50 rounded-2xl p-6 shadow-2xl shadow-black/40 border-t-gold-400/30"
    >
      <div className="mb-6">
        <h2
          id="expense-list-heading"
          className="text-lg font-bold text-white"
        >
          כל ההוצאות
        </h2>
        <p className="mt-1 text-sm text-white/70">מהחדש לישן</p>
      </div>

      {status === "loading" ? <LoadingState /> : null}

      {status === "empty" ? <EmptyState /> : null}

      {status === "error" ? (
        <ErrorState
          message={error ?? "משהו השתבש בעת טעינת ההוצאות."}
          onRetry={() => router.refresh()}
        />
      ) : null}

      {status === "success" ? (
        <ul className="divide-y divide-white/5 border-t border-olive-700/40 -mx-6 -mb-6 mt-4 max-h-[400px] overflow-y-auto">
          {expenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
