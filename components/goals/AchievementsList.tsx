"use client";

import type { MonthlyAchievement } from "@/lib/goals";
import { formatGoalCurrency, type Currency } from "@/lib/currency";

type AchievementsListProps = {
  achievements: MonthlyAchievement[];
  currency: Currency;
};

function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex - 1, 1));
}

export function AchievementsList({
  achievements,
  currency,
}: AchievementsListProps) {
  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
      <h2 className="text-lg font-bold text-white">הישגים קודמים 🏆</h2>

      {achievements.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">
          עדיין אין הישגים — התחל לחסוך!
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {achievements.map((achievement) => (
            <li
              key={achievement.month}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">
                  {formatMonthLabel(achievement.month)}
                </p>
                <p className="text-sm text-white/60">
                  יעד: {formatGoalCurrency(achievement.goalAmount, currency)} ·
                  חיסכון:{" "}
                  {formatGoalCurrency(achievement.actualSaved, currency)}
                </p>
              </div>
              <div className="text-sm font-semibold">
                {achievement.achieved && achievement.bonusEarned ? (
                  <span className="text-gold-300">{achievement.bonusEarned}</span>
                ) : (
                  <span className="text-white/50">❌ לא הושג</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
