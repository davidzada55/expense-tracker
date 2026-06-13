import { getDifficultyConfig } from "@/lib/difficulty";
import type { Currency } from "@/lib/currency";

export type SavingsGoal = {
  id: string;
  baseGoal: number;
  monthlyGrowthPercent: number;
  startMonth: string;
  currency: Currency;
};

export type MonthlyAchievement = {
  month: string;
  goalAmount: number;
  actualSaved: number;
  achieved: boolean;
  bonusEarned: string | null;
};

const GOAL_STORAGE_KEY = "savings-goal";
const ACHIEVEMENTS_STORAGE_KEY = "monthly-achievements";
const INCOME_STORAGE_KEY = "monthly-income";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function monthsSinceStart(startMonth: string, targetMonth: string): number {
  const [startYear, startMonthIndex] = startMonth.split("-").map(Number);
  const [targetYear, targetMonthIndex] = targetMonth.split("-").map(Number);

  return (
    (targetYear - startYear) * 12 + (targetMonthIndex - startMonthIndex)
  );
}

export function getGoal(): SavingsGoal | null {
  return readJson<SavingsGoal | null>(GOAL_STORAGE_KEY, null);
}

export function saveGoal(goal: SavingsGoal): void {
  writeJson(GOAL_STORAGE_KEY, goal);
}

export function getGoalForMonth(goal: SavingsGoal, targetMonth: string): number {
  const months = Math.max(0, monthsSinceStart(goal.startMonth, targetMonth));
  const growthFactor = 1 + goal.monthlyGrowthPercent / 100;
  return Math.round(goal.baseGoal * Math.pow(growthFactor, months));
}

export function getAchievements(): MonthlyAchievement[] {
  return readJson<MonthlyAchievement[]>(ACHIEVEMENTS_STORAGE_KEY, []);
}

export function saveAchievement(achievement: MonthlyAchievement): void {
  const achievements = getAchievements();
  const index = achievements.findIndex((item) => item.month === achievement.month);

  if (index >= 0) {
    achievements[index] = achievement;
  } else {
    achievements.push(achievement);
  }

  achievements.sort((a, b) => b.month.localeCompare(a.month));
  writeJson(ACHIEVEMENTS_STORAGE_KEY, achievements);
}

export function getSavingsForecast(
  goal: SavingsGoal,
  months: number,
): { month: string; goalAmount: number }[] {
  const forecast: { month: string; goalAmount: number }[] = [];
  const [startYear, startMonthIndex] = getCurrentMonthKey().split("-").map(Number);

  for (let offset = 0; offset < months; offset += 1) {
    const date = new Date(startYear, startMonthIndex - 1 + offset, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    forecast.push({
      month: monthKey,
      goalAmount: getGoalForMonth(goal, monthKey),
    });
  }

  return forecast;
}

export function getBonusTitle(achievedPercent: number): string | null {
  const { streakBonusMultiplier } = getDifficultyConfig();
  const bronzeThreshold = 100 * streakBonusMultiplier;
  const silverThreshold = 120 * streakBonusMultiplier;
  const goldThreshold = 150 * streakBonusMultiplier;

  if (achievedPercent < bronzeThreshold) {
    return null;
  }

  if (achievedPercent < silverThreshold) {
    return "🥉 חוסך מתחיל";
  }

  if (achievedPercent < goldThreshold) {
    return "🥈 חוסך מתקדם";
  }

  return "🥇 חוסך מצטיין";
}

type MonthlyIncomeStore = Record<string, number>;

export function getMonthlyIncome(month: string): number | null {
  const store = readJson<MonthlyIncomeStore>(INCOME_STORAGE_KEY, {});
  const value = store[month];
  return typeof value === "number" && value > 0 ? value : null;
}

export function saveMonthlyIncome(month: string, amount: number): void {
  const store = readJson<MonthlyIncomeStore>(INCOME_STORAGE_KEY, {});
  store[month] = amount;
  writeJson(INCOME_STORAGE_KEY, store);
}

export function createGoalId(): string {
  return `goal-${Date.now()}`;
}
