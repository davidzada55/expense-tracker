"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  DIFFICULTY_CONFIGS,
  getDifficulty,
  type DifficultyLevel,
} from "@/lib/difficulty";
import { DIFFICULTY_STYLES } from "@/lib/difficulty-styles";

const NAV_ITEMS = [
  { href: "/", label: "הוצאות" },
  { href: "/goals", label: "יעדים 🎯" },
  { href: "/stocks", label: "מניות 📈" },
];

export function AppNav() {
  const pathname = usePathname();
  const [level, setLevel] = useState<DifficultyLevel>("medium");

  useEffect(() => {
    function syncLevel() {
      setLevel(getDifficulty() ?? "medium");
    }

    syncLevel();
    window.addEventListener("difficulty-changed", syncLevel);
    return () => window.removeEventListener("difficulty-changed", syncLevel);
  }, []);

  if (pathname === "/onboarding") {
    return null;
  }

  const styles = DIFFICULTY_STYLES[level];
  const config = DIFFICULTY_CONFIGS[level];

  return (
    <nav className={`border-b backdrop-blur-md ${styles.border} ${styles.bg}`}>
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-4 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? `${styles.bgSelected} text-white`
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}
        >
          {config.emoji} {config.label}
        </span>
      </div>
    </nav>
  );
}
