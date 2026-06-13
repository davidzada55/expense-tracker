"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DifficultyPicker } from "@/components/difficulty/DifficultyPicker";
import {
  DIFFICULTY_CONFIGS,
  getDifficulty,
  saveDifficulty,
  type DifficultyLevel,
} from "@/lib/difficulty";
import { getDifficultyButtonClassName } from "@/lib/difficulty-styles";
import {
  createGoalId,
  getCurrentMonthKey,
  getGoal,
  saveGoal,
} from "@/lib/goals";
import {
  getCurrencySymbol,
  saveCurrency,
  type Currency,
} from "@/lib/currency";

const SUGGESTED_GOALS: Record<DifficultyLevel, number> = {
  easy: 500,
  medium: 1000,
  hard: 2000,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>("medium");
  const [baseGoal, setBaseGoal] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ILS");

  useEffect(() => {
    const stored = getDifficulty();
    if (stored) {
      setSelectedLevel(stored);
    }
  }, []);

  function handleContinue() {
    setBaseGoal(SUGGESTED_GOALS[selectedLevel].toString());
    setStep(2);
  }

  function handleFinish() {
    const parsedGoal = Number(baseGoal);
    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
      return;
    }

    const config = DIFFICULTY_CONFIGS[selectedLevel];
    const existingGoal = getGoal();

    saveDifficulty(selectedLevel);
    saveCurrency(selectedCurrency);
    saveGoal({
      id: existingGoal?.id ?? createGoalId(),
      baseGoal: parsedGoal,
      monthlyGrowthPercent: config.monthlyGrowthPercent,
      startMonth: existingGoal?.startMonth ?? getCurrentMonthKey(),
      currency: selectedCurrency,
    });

    router.replace("/");
  }

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              step === 1 ? "bg-olive-400" : "bg-white/30"
            }`}
          />
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              step === 2 ? "bg-olive-400" : "bg-white/30"
            }`}
          />
        </div>

        <div className="relative z-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-8">
          {step === 1 ? (
            <div className="transition-opacity duration-300">
              <h1 className="text-center text-3xl font-bold text-white">
                ברוך הבא למעקב הפיננסי שלך 👋
              </h1>
              <p className="mt-3 text-center text-white/70">
                בחר את רמת האתגר שמתאימה לך
              </p>

              <div className="mt-8">
                <DifficultyPicker
                  selectedLevel={selectedLevel}
                  onSelect={setSelectedLevel}
                />
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className={getDifficultyButtonClassName(selectedLevel)}
                >
                  המשך
                </button>
                <p className="text-xs text-white/50">
                  נבחר: {DIFFICULTY_CONFIGS[selectedLevel].emoji}{" "}
                  {DIFFICULTY_CONFIGS[selectedLevel].label}
                </p>
              </div>
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <h2 className="text-center text-2xl font-bold text-white">
                הגדר את יעד החיסכון הראשון שלך
              </h2>
              <p className="mt-2 text-center text-sm text-white/60">
                רמה: {DIFFICULTY_CONFIGS[selectedLevel].emoji}{" "}
                {DIFFICULTY_CONFIGS[selectedLevel].label}
              </p>

              <div className="mt-8 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-white">
                    יעד חודשי ראשוני ({getCurrencySymbol(selectedCurrency)})
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={baseGoal}
                    onChange={(event) => setBaseGoal(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-white outline-none transition focus:border-olive-400"
                  />
                </label>

                <div className="flex gap-2">
                  {(["ILS", "USD"] as const).map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setSelectedCurrency(currency)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        selectedCurrency === currency
                          ? "border border-olive-400 bg-olive-500/30 text-white"
                          : "border border-white/20 bg-white/5 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {getCurrencySymbol(currency)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  חזור
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className={getDifficultyButtonClassName(selectedLevel)}
                >
                  סיים והתחל
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
