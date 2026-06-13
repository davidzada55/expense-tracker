"use client";

import { useEffect, useState } from "react";

import {
  createGoalId,
  getCurrentMonthKey,
  getGoal,
  saveGoal,
  type SavingsGoal,
} from "@/lib/goals";
import { getDifficultyConfig } from "@/lib/difficulty";
import {
  formatGoalCurrency,
  getCurrency,
  getCurrencySymbol,
  type Currency,
} from "@/lib/currency";

type GoalSetupProps = {
  onGoalSaved: (goal: SavingsGoal) => void;
};

export function GoalSetup({ onGoalSaved }: GoalSetupProps) {
  const [existingGoal, setExistingGoal] = useState<SavingsGoal | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [baseGoal, setBaseGoal] = useState("");
  const [monthlyGrowthPercent, setMonthlyGrowthPercent] = useState(5);
  const [startMonth, setStartMonth] = useState(getCurrentMonthKey());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ILS");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const goal = getGoal();
    const difficulty = getDifficultyConfig();

    setExistingGoal(goal);
    setIsEditing(!goal);
    setBaseGoal(goal?.baseGoal.toString() ?? "");
    setMonthlyGrowthPercent(
      goal?.monthlyGrowthPercent ?? difficulty.monthlyGrowthPercent,
    );
    setStartMonth(goal?.startMonth ?? getCurrentMonthKey());
    setSelectedCurrency(goal?.currency ?? getCurrency());
    setIsHydrated(true);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedBaseGoal = Number(baseGoal);
    if (!Number.isFinite(parsedBaseGoal) || parsedBaseGoal <= 0) {
      return;
    }

    const goal: SavingsGoal = {
      id: existingGoal?.id ?? createGoalId(),
      baseGoal: parsedBaseGoal,
      monthlyGrowthPercent,
      startMonth,
      currency: selectedCurrency,
    };

    saveGoal(goal);
    setExistingGoal(goal);
    onGoalSaved(goal);
    setIsEditing(false);
  }

  if (!isHydrated) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        טוען הגדרות יעד...
      </section>
    );
  }

  if (existingGoal && !isEditing) {
    return (
      <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">הגדרת יעד חיסכון 🎯</h2>
            <p className="mt-2 text-sm text-white/70">
              יעד בסיס: {formatGoalCurrency(existingGoal.baseGoal, existingGoal.currency)}
            </p>
            <p className="text-sm text-white/70">
              גידול חודשי: {existingGoal.monthlyGrowthPercent}%
            </p>
            <p className="text-sm text-white/70">
              התחלה: {existingGoal.startMonth}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ערוך
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
      <h2 className="text-lg font-bold text-white">הגדרת יעד חיסכון 🎯</h2>
      <p className="mt-1 text-sm text-white/70">
        הגדירו יעד חודשי שיגדל אוטומטית עם הזמן.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white">
            יעד חודשי התחלתי ({getCurrencySymbol(selectedCurrency)})
          </span>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={baseGoal}
            onChange={(event) => setBaseGoal(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-olive-400 focus:ring-1 focus:ring-olive-400/40"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white">גידול חודשי (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            required
            value={monthlyGrowthPercent}
            onChange={(event) =>
              setMonthlyGrowthPercent(Number(event.target.value))
            }
            className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-olive-400 focus:ring-1 focus:ring-olive-400/40"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white">חודש התחלה</span>
          <input
            type="month"
            required
            value={startMonth}
            onChange={(event) => setStartMonth(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-olive-400 focus:ring-1 focus:ring-olive-400/40"
          />
        </label>

        <div className="flex gap-2">
          {(["ILS", "USD"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedCurrency(option)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                selectedCurrency === option
                  ? "border border-olive-400 bg-olive-500/30 text-white"
                  : "border border-white/20 bg-white/5 text-white/70 hover:bg-white/15"
              }`}
            >
              {getCurrencySymbol(option)}
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-olive-500 to-olive-400 px-6 py-3 text-sm font-bold text-olive-950 transition hover:from-olive-400 hover:to-olive-300"
          >
            שמור יעד
          </button>
          {existingGoal ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              ביטול
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
