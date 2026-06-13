import type { DifficultyLevel } from "@/lib/difficulty";

export type DifficultyStyle = {
  border: string;
  borderSelected: string;
  bg: string;
  bgHover: string;
  bgSelected: string;
  ring: string;
  text: string;
  badge: string;
  button: string;
};

export const DIFFICULTY_STYLES: Record<DifficultyLevel, DifficultyStyle> = {
  easy: {
    border: "border-emerald-500/40",
    borderSelected: "border-emerald-400",
    bg: "bg-emerald-500/10",
    bgHover: "hover:bg-emerald-500/20 hover:border-emerald-400/60",
    bgSelected: "bg-emerald-500/30",
    ring: "ring-emerald-400/70",
    text: "text-emerald-300",
    badge: "bg-emerald-500/25 text-emerald-200",
    button: "from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300",
  },
  medium: {
    border: "border-amber-500/40",
    borderSelected: "border-amber-400",
    bg: "bg-amber-500/10",
    bgHover: "hover:bg-amber-500/20 hover:border-amber-400/60",
    bgSelected: "bg-amber-500/30",
    ring: "ring-amber-400/70",
    text: "text-amber-300",
    badge: "bg-amber-500/25 text-amber-200",
    button: "from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300",
  },
  hard: {
    border: "border-red-500/40",
    borderSelected: "border-red-400",
    bg: "bg-red-500/10",
    bgHover: "hover:bg-red-500/20 hover:border-red-400/60",
    bgSelected: "bg-red-500/30",
    ring: "ring-red-400/70",
    text: "text-red-300",
    badge: "bg-red-500/25 text-red-200",
    button: "from-red-500 to-red-400 hover:from-red-400 hover:to-red-300",
  },
};

export function getDifficultyCardClassName(
  level: DifficultyLevel,
  isSelected: boolean,
): string {
  const styles = DIFFICULTY_STYLES[level];

  return [
    "relative z-10 w-full cursor-pointer rounded-2xl border-2 p-5 text-right transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-950",
    styles.bg,
    isSelected
      ? `${styles.bgSelected} ${styles.borderSelected} scale-[1.03] ring-2 ${styles.ring} shadow-lg`
      : `${styles.border} ${styles.bgHover} scale-100`,
  ].join(" ");
}

export function getDifficultyButtonClassName(level: DifficultyLevel): string {
  return `rounded-xl bg-gradient-to-r ${DIFFICULTY_STYLES[level].button} px-8 py-3 text-sm font-bold text-white shadow-lg transition enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40`;
}
