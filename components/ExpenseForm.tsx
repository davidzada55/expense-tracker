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
      className="w-full min-h-11 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:via-gold-300 hover:to-gold-400 text-olive-950 font-bold px-6 py-3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 border border-gold-300/30 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20"
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
      className="bg-[#12160e]/80 backdrop-blur-md border border-olive-700/50 rounded-2xl p-6 shadow-2xl shadow-black/40 border-t-gold-400/30"
    >
      <div className="mb-6">
        <h2
          id="add-expense-heading"
          className="text-lg font-bold text-white flex items-center gap-2"
        >
          <svg
            className="h-5 w-5 text-gold-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          הוצאה חדשה
        </h2>
        <p className="mt-1 text-sm text-white/70">
          רשמו רכישה כדי לשמור על הסיכומים החודשיים מעודכנים.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white">סכום</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white placeholder-white/50 outline-none transition focus:border-gold-300 focus:ring-1 focus:ring-gold-300/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white">קטגוריה</span>
            <select
              name="category"
              required
              defaultValue="food"
              className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-gold-300 focus:ring-1 focus:ring-gold-300/50"
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category} className="bg-olive-950 text-white">
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white">תאריך</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white placeholder-white/50 outline-none transition focus:border-gold-300 focus:ring-1 focus:ring-gold-300/50"
            />
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-white">
              הערה <span className="font-normal text-white/55">(אופציונלי)</span>
            </span>
            <textarea
              name="note"
              rows={3}
              maxLength={500}
              placeholder="על מה הייתה ההוצאה?"
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-white/50 outline-none transition focus:border-gold-300 focus:ring-1 focus:ring-gold-300/50"
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
