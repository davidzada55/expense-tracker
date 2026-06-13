"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getBonusTitle,
  getCurrentMonthKey,
  getGoalForMonth,
  getMonthlyIncome,
  saveAchievement,
  saveMonthlyIncome,
  type SavingsGoal,
} from "@/lib/goals";
import { formatGoalCurrency } from "@/lib/currency";

type CurrentMonthGoalProps = {
  goal: SavingsGoal;
  monthlyExpenses: number;
  onAchievementUpdated?: () => void;
};

function getProgressColor(percent: number): string {
  if (percent >= 100) {
    return "bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400 animate-pulse";
  }

  if (percent >= 80) {
    return "bg-emerald-400";
  }

  if (percent >= 50) {
    return "bg-amber-400";
  }

  return "bg-red-400";
}

export function CurrentMonthGoal({
  goal,
  monthlyExpenses,
  onAchievementUpdated,
}: CurrentMonthGoalProps) {
  const currentMonth = getCurrentMonthKey();
  const goalAmount = getGoalForMonth(goal, currentMonth);
  const [incomeInput, setIncomeInput] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);

  useEffect(() => {
    const storedIncome = getMonthlyIncome(currentMonth);
    setMonthlyIncome(storedIncome);
    setIncomeInput(storedIncome?.toString() ?? "");
  }, [currentMonth]);

  const actualSaved =
    monthlyIncome !== null ? Math.max(0, monthlyIncome - monthlyExpenses) : 0;
  const progressPercent =
    goalAmount > 0 ? Math.min(150, (actualSaved / goalAmount) * 100) : 0;
  const achievedPercent =
    goalAmount > 0 ? (actualSaved / goalAmount) * 100 : 0;
  const achieved = actualSaved >= goalAmount;
  const bonusTitle = getBonusTitle(achievedPercent);
  const onAchievementUpdatedRef = useRef(onAchievementUpdated);
  const lastSavedSnapshotRef = useRef("");

  useEffect(() => {
    onAchievementUpdatedRef.current = onAchievementUpdated;
  }, [onAchievementUpdated]);

  useEffect(() => {
    if (monthlyIncome === null || actualSaved <= 0) {
      return;
    }

    const snapshot = JSON.stringify({
      month: currentMonth,
      goalAmount,
      actualSaved,
      achieved,
      bonusEarned: achieved ? bonusTitle : null,
    });

    if (lastSavedSnapshotRef.current === snapshot) {
      return;
    }

    lastSavedSnapshotRef.current = snapshot;

    saveAchievement({
      month: currentMonth,
      goalAmount,
      actualSaved,
      achieved,
      bonusEarned: achieved ? bonusTitle : null,
    });
    onAchievementUpdatedRef.current?.();
  }, [
    achieved,
    actualSaved,
    bonusTitle,
    currentMonth,
    goalAmount,
    monthlyIncome,
  ]);

  function handleIncomeSave() {
    const parsed = Number(incomeInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    saveMonthlyIncome(currentMonth, parsed);
    setMonthlyIncome(parsed);
  }

  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white">יעד החודש הנוכחי</h2>
        <span className="text-2xl font-bold text-olive-300">
          {formatGoalCurrency(goalAmount, goal.currency)}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm text-white/70">
          <span>התקדמות</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progressPercent)}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {achieved && bonusTitle ? (
        <div className="mt-6 animate-pulse rounded-xl border border-gold-400/40 bg-gold-500/20 px-4 py-4 text-center">
          <p className="text-lg font-bold text-gold-200">
            🎉 הגעת ליעד החודש! {bonusTitle}
          </p>
        </div>
      ) : null}

      <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="font-semibold text-white">כמה חסכתי?</h3>

        {monthlyIncome === null ? (
          <div className="space-y-3">
            <p className="text-sm text-white/70">
              הזן הכנסה חודשית להשוואה
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min="1"
                step="1"
                value={incomeInput}
                onChange={(event) => setIncomeInput(event.target.value)}
                placeholder="הכנסה חודשית"
                className="min-h-11 flex-1 rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-olive-400"
              />
              <button
                type="button"
                onClick={handleIncomeSave}
                className="rounded-xl bg-olive-500 px-4 py-2 text-sm font-bold text-olive-950 transition hover:bg-olive-400"
              >
                שמור
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-white/60">הכנסה</p>
              <p className="mt-1 font-bold text-white">
                {formatGoalCurrency(monthlyIncome, goal.currency)}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-white/60">הוצאות</p>
              <p className="mt-1 font-bold text-white">
                {formatGoalCurrency(monthlyExpenses, goal.currency)}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-white/60">חיסכון</p>
              <p className="mt-1 font-bold text-olive-300">
                {formatGoalCurrency(actualSaved, goal.currency)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
