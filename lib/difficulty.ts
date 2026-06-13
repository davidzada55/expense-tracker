export type DifficultyLevel = "easy" | "medium" | "hard";

export type DifficultyConfig = {
  level: DifficultyLevel;
  label: string;
  emoji: string;
  description: string;
  monthlyGrowthPercent: number;
  budgetWarningMultiplier: number;
  budgetCriticalMultiplier: number;
  streakBonusMultiplier: number;
};

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: "easy",
    label: "קל",
    emoji: "🌱",
    description: "יעדים נוחים, גידול הדרגתי של 3% בחודש. מתאים למתחילים.",
    monthlyGrowthPercent: 3,
    budgetWarningMultiplier: 1.2,
    budgetCriticalMultiplier: 1.2,
    streakBonusMultiplier: 1.0,
  },
  medium: {
    level: "medium",
    label: "בינוני",
    emoji: "🔥",
    description: "גידול של 5% בחודש. אתגר מאוזן לרוב האנשים.",
    monthlyGrowthPercent: 5,
    budgetWarningMultiplier: 1.0,
    budgetCriticalMultiplier: 1.0,
    streakBonusMultiplier: 1.5,
  },
  hard: {
    level: "hard",
    label: "מאתגר",
    emoji: "💎",
    description: "גידול של 10% בחודש. לאלה שרוצים להגיע רחוק מהר.",
    monthlyGrowthPercent: 10,
    budgetWarningMultiplier: 0.8,
    budgetCriticalMultiplier: 0.8,
    streakBonusMultiplier: 2.0,
  },
};

const DIFFICULTY_STORAGE_KEY = "app-difficulty";

export function getDifficulty(): DifficultyLevel | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
  if (stored === "easy" || stored === "medium" || stored === "hard") {
    return stored;
  }

  return null;
}

export function saveDifficulty(level: DifficultyLevel): void {
  localStorage.setItem(DIFFICULTY_STORAGE_KEY, level);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("difficulty-changed"));
  }
}

export function getDifficultyConfig(): DifficultyConfig {
  const level = getDifficulty();
  return level ? DIFFICULTY_CONFIGS[level] : DIFFICULTY_CONFIGS.medium;
}

export function isOnboardingDone(): boolean {
  return getDifficulty() !== null;
}
