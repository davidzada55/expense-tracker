"use client";

import { useEffect, useState } from "react";

import { getDifficulty, type DifficultyLevel } from "@/lib/difficulty";

const OVERLAY_CLASS: Record<DifficultyLevel, string> = {
  easy: "bg-emerald-900/25",
  medium: "bg-amber-900/20",
  hard: "bg-red-900/25",
};

export function DifficultyTheme() {
  const [level, setLevel] = useState<DifficultyLevel>("medium");

  useEffect(() => {
    function applyTheme() {
      const nextLevel = getDifficulty() ?? "medium";
      setLevel(nextLevel);
      document.body.dataset.difficulty = nextLevel;
    }

    applyTheme();

    window.addEventListener("storage", applyTheme);
    window.addEventListener("difficulty-changed", applyTheme);

    return () => {
      window.removeEventListener("storage", applyTheme);
      window.removeEventListener("difficulty-changed", applyTheme);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 transition-colors duration-500 ${OVERLAY_CLASS[level]}`}
    />
  );
}
