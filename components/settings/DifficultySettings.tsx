"use client";

import { useEffect, useState } from "react";

import { DifficultyPicker } from "@/components/difficulty/DifficultyPicker";
import {
  DIFFICULTY_CONFIGS,
  getDifficulty,
  saveDifficulty,
  type DifficultyLevel,
} from "@/lib/difficulty";
import {
  DIFFICULTY_STYLES,
  getDifficultyButtonClassName,
} from "@/lib/difficulty-styles";
import { getGoal, saveGoal } from "@/lib/goals";

export function DifficultySettings() {
  const [currentLevel, setCurrentLevel] = useState<DifficultyLevel>("medium");
  const currentConfig = DIFFICULTY_CONFIGS[currentLevel];
  const currentStyles = DIFFICULTY_STYLES[currentLevel];
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>("medium");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    const stored = getDifficulty();
    if (stored) {
      setCurrentLevel(stored);
      setSelectedLevel(stored);
    }
  }, []);

  function handleSave() {
    saveDifficulty(selectedLevel);
    const config = DIFFICULTY_CONFIGS[selectedLevel];
    const goal = getGoal();

    if (goal) {
      saveGoal({
        ...goal,
        monthlyGrowthPercent: config.monthlyGrowthPercent,
      });
    }

    setCurrentLevel(selectedLevel);
    setConfirmation(`הרמה עודכנה ל-${config.emoji} ${config.label}`);
    setIsPickerOpen(false);
    setTimeout(() => setConfirmation(null), 3000);
  }

  return (
    <section
      className={`rounded-2xl border-2 p-6 shadow-xl backdrop-blur-md ${currentStyles.border} ${currentStyles.bg}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">רמת קושי</h2>
          <p className={`mt-1 text-sm font-semibold ${currentStyles.text}`}>
            {currentConfig.emoji} {currentConfig.label}
          </p>
          <p className="mt-1 text-sm text-white/70">{currentConfig.description}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedLevel(currentLevel);
            setIsPickerOpen((open) => !open);
          }}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold text-white transition ${currentStyles.borderSelected} ${currentStyles.bgSelected} hover:opacity-90`}
        >
          שנה רמה
        </button>
      </div>

      {confirmation ? (
        <p className="mt-4 text-sm text-emerald-300">{confirmation}</p>
      ) : null}

      {isPickerOpen ? (
        <div className="mt-6 space-y-4">
          <DifficultyPicker
            selectedLevel={selectedLevel}
            onSelect={setSelectedLevel}
            name="difficulty-settings"
          />
          <button
            type="button"
            onClick={handleSave}
            className={getDifficultyButtonClassName(selectedLevel)}
          >
            שמור רמה
          </button>
        </div>
      ) : null}
    </section>
  );
}
