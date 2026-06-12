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
          className="h-24 animate-pulse rounded-2xl border border-stone-200 bg-white"
        />
      ))}
      <p className="text-sm text-stone-500">טוען את ההוצאות שלך...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
      <p className="text-base font-medium text-stone-900">אין הוצאות עדיין</p>
      <p className="mt-2 text-sm text-stone-500">
        הוסיפו את ההוצאה הראשונה למעלה כדי להתחיל לעקוב.
      </p>
      <a
        href="#add-expense"
        className="mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-stone-900 px-6 text-sm font-medium text-white transition hover:bg-stone-800"
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
      className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5"
    >
      <p className="font-medium text-red-800">לא ניתן לטעון את ההוצאות</p>
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

export function ExpenseList({ status, expenses = [], error }: ExpenseListProps) {
  const router = useRouter();

  return (
    <section
      aria-labelledby="expense-list-heading"
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2
          id="expense-list-heading"
          className="text-lg font-semibold text-stone-900"
        >
          כל ההוצאות
        </h2>
        <p className="mt-1 text-sm text-stone-500">מהחדש לישן</p>
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
        <ul className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
