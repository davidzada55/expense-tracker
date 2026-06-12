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
      className="w-full min-h-11 inline-flex items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium px-6 py-3 transition-all duration-200 disabled:cursor-not-allowed disabled:bg-purple-500/50"
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
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl shadow-black/20"
    >
      <div className="mb-6">
        <h2
          id="add-expense-heading"
          className="text-lg font-semibold text-white/90 flex items-center gap-2"
        >
          <svg
            className="h-5 w-5 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          הוצאה חדשה
        </h2>
        <p className="mt-1 text-sm text-white/60">
          רשמו רכישה כדי לשמור על הסיכומים החודשיים מעודכנים.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/80">סכום</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/80">קטגוריה</span>
            <select
              name="category"
              required
              defaultValue="food"
              className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category} className="bg-slate-900 text-white">
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-white/80">תאריך</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
            />
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-white/80">
              הערה <span className="font-normal text-white/40">(אופציונלי)</span>
            </span>
            <textarea
              name="note"
              rows={3}
              maxLength={500}
              placeholder="על מה הייתה ההוצאה?"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
            />
          </label>
        </div>

        {state.status === "error" ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-200"
          >
            <p>{state.message}</p>
          </div>
        ) : null}

        {state.status === "success" ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-200"
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
