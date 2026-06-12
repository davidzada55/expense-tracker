"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  addExpenseFormAction,
  type ExpenseFormState,
} from "@/app/actions/expenses";
import { expenseCategories } from "@/lib/schemas";
import { formatCategory } from "@/lib/format";

const initialState: ExpenseFormState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
    >
      {pending ? "מוסיף..." : "הוסף הוצאה"}
    </button>
  );
}

export function ExpenseForm() {
  const [state, formAction] = useFormState(addExpenseFormAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      id="add-expense"
      aria-labelledby="add-expense-heading"
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2
          id="add-expense-heading"
          className="text-lg font-semibold text-stone-900"
        >
          הוספת הוצאה
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          רשמו רכישה כדי לשמור על הסיכומים החודשיים מעודכנים.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">סכום</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="min-h-11 w-full rounded-xl border border-stone-300 px-4 text-stone-900 outline-none ring-stone-900 transition focus:border-stone-900 focus:ring-2"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">קטגוריה</span>
            <select
              name="category"
              required
              defaultValue="food"
              className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-stone-900 outline-none ring-stone-900 transition focus:border-stone-900 focus:ring-2"
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">תאריך</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 text-stone-900 outline-none ring-stone-900 transition focus:border-stone-900 focus:ring-2"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">
            הערה <span className="font-normal text-stone-400">(אופציונלי)</span>
          </span>
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            placeholder="על מה הייתה ההוצאה?"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none ring-stone-900 transition focus:border-stone-900 focus:ring-2"
          />
        </label>

        {state.status === "error" ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p>{state.message}</p>
          </div>
        ) : null}

        {state.status === "success" ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <p>{state.message}</p>
          </div>
        ) : null}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
