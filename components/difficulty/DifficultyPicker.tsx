"use client";

import {
  DIFFICULTY_CONFIGS,
  type DifficultyLevel,
} from "@/lib/difficulty";
import {
  DIFFICULTY_STYLES,
  getDifficultyCardClassName,
} from "@/lib/difficulty-styles";

type DifficultyPickerProps = {
  selectedLevel: DifficultyLevel | null;
  onSelect: (level: DifficultyLevel) => void;
  name?: string;
};

export function DifficultyPicker({
  selectedLevel,
  onSelect,
  name = "difficulty",
}: DifficultyPickerProps) {
  const levels = Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[];

  return (
    <div
      role="radiogroup"
      aria-label="בחירת רמת קושי"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {levels.map((level) => {
        const config = DIFFICULTY_CONFIGS[level];
        const styles = DIFFICULTY_STYLES[level];
        const isSelected = selectedLevel === level;

        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={isSelected}
            name={name}
            onClick={() => onSelect(level)}
            className={getDifficultyCardClassName(level, isSelected)}
          >
            {isSelected ? (
              <span
                className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold ${styles.badge}`}
              >
                נבחר
              </span>
            ) : null}
            <div className="text-4xl">{config.emoji}</div>
            <p className={`mt-3 text-lg font-bold ${isSelected ? styles.text : "text-white"}`}>
              {config.label}
            </p>
            <p className="mt-2 text-sm text-white/70">{config.description}</p>
            <p className={`mt-3 text-xs font-semibold ${styles.text}`}>
              גידול חודשי: {config.monthlyGrowthPercent}%
            </p>
          </button>
        );
      })}
    </div>
  );
}
