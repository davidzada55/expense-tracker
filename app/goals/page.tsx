"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { getExpenses } from "@/app/actions/expenses";
import { AchievementsList } from "@/components/goals/AchievementsList";
import { CurrentMonthGoal } from "@/components/goals/CurrentMonthGoal";
import { GoalSetup } from "@/components/goals/GoalSetup";
import { SavingsForecastChartLazy } from "@/components/goals/SavingsForecastChartLazy";
import { DifficultySettings } from "@/components/settings/DifficultySettings";
import { filterExpensesForCurrentMonth, getMonthlyTotal } from "@/lib/expenses";
import { getAchievements, getCurrentMonthKey, getGoal, type MonthlyAchievement, type SavingsGoal } from "@/lib/goals";
import { getCurrentMonthLabel } from "@/lib/format";

export default function GoalsPage() {
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [achievements, setAchievements] = useState<MonthlyAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setGoal(getGoal());
    setAchievements(getAchievements());

    async function loadExpenses() {
      const result = await getExpenses();
      if (result.success) {
        const monthExpenses = filterExpensesForCurrentMonth(result.data);
        setMonthlyExpenses(getMonthlyTotal(monthExpenses));
      }
      setIsLoading(false);
    }

    void loadExpenses();
  }, []);

  function handleGoalSaved(nextGoal: SavingsGoal) {
    setGoal(nextGoal);
  }

  const handleAchievementUpdated = useCallback(() => {
    setAchievements(getAchievements());
  }, []);

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto px-4 py-8 md:px-8 flex flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            יעדי חיסכון 🎯
          </h1>
          <p className="mt-1 text-sm text-white/60">
            עקבו אחר יעדי החיסכון, הישגים ותחזית לחודשים הבאים.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="text-xl font-bold text-olive-300">
            {getCurrentMonthLabel()}
          </div>
          <Link
            href="/"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            ← חזרה להוצאות
          </Link>
        </div>
      </header>

      <GoalSetup onGoalSaved={handleGoalSaved} />
      <DifficultySettings />

      {isLoading ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          טוען נתונים...
        </section>
      ) : null}

      {goal ? (
        <>
          <CurrentMonthGoal
            goal={goal}
            monthlyExpenses={monthlyExpenses}
            onAchievementUpdated={handleAchievementUpdated}
          />
          <AchievementsList
            achievements={achievements.filter(
              (item) => item.month !== getCurrentMonthKey(),
            )}
            currency={goal.currency}
          />
          <SavingsForecastChartLazy goal={goal} />
        </>
      ) : null}
    </main>
  );
}
