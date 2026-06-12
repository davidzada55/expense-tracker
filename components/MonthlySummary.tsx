"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  filterExpensesForCurrentMonth,
  filterExpensesForPreviousMonth,
  getCategoryTotals,
  getMonthlyTotal,
} from "@/lib/expenses";
import { expenseCategories } from "@/lib/schemas";
import { formatCategory, formatCurrency, getCurrentMonthLabel } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";

type MonthlySummaryStatus = "loading" | "empty" | "error" | "success";

type MonthlySummaryProps = {
  status: MonthlySummaryStatus;
  expenses?: Expense[];
  error?: string;
};

const categoryDots: Record<ExpenseCategory, string> = {
  food: "bg-emerald-400",
  transport: "bg-blue-400",
  housing: "bg-amber-400",
  health: "bg-rose-400",
  entertainment: "bg-violet-400",
  investments: "bg-cyan-400",
  other: "bg-slate-400",
};

const categoryColors: Record<ExpenseCategory, string> = {
  food: "#34d399",          // bg-emerald-400
  transport: "#60a5fa",     // bg-blue-400
  housing: "#fbbf24",       // bg-amber-400
  health: "#fb7185",        // bg-rose-400
  entertainment: "#c084fc", // bg-violet-400
  investments: "#22d3ee",   // bg-cyan-400
  other: "#94a3b8",         // bg-slate-400
};

function LoadingState() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
      <p className="text-sm text-white/50">טוען סיכום חודשי...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-8 text-center">
      <p className="font-medium text-white">אין הוצאות החודש</p>
      <p className="mt-2 text-sm text-white/60">
        הוצאות שתוסיפו ל{getCurrentMonthLabel()} יופיעו כאן.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/20 px-5 py-4"
    >
      <p className="font-medium text-red-200">לא ניתן לטעון את הסיכום החודשי</p>
      <p className="mt-2 text-sm text-red-300/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
      >
        נסה שוב
      </button>
    </div>
  );
}

function renderFormattedSummary(text: string) {
  const lines = text.split("\n");

  return lines.map((line, index) => {
    let cleanLine = line.trim();
    if (cleanLine === "") {
      return <div key={index} className="h-3" />;
    }

    const isBullet = cleanLine.startsWith("•") || cleanLine.startsWith("-");
    if (isBullet) {
      cleanLine = cleanLine.replace(/^[•-]\s*/, "");
    }

    // Parse **bold** syntax
    const parts = cleanLine.split("**");
    const formattedLine = parts.map((part, partIndex) => {
      if (partIndex % 2 === 1) {
        return (
          <strong key={partIndex} className="font-bold text-white">
            {part}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={index} className="mr-4 flex items-start gap-1.5 py-1">
          <span className="text-emerald-400 font-bold select-none">•</span>
          <div className="flex-1">{formattedLine}</div>
        </div>
      );
    }

    return (
      <p key={index} className="py-1">
        {formattedLine}
      </p>
    );
  });
}

export function MonthlySummary({
  status,
  expenses = [],
  error,
}: MonthlySummaryProps) {
  const router = useRouter();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<ExpenseCategory | null>(null);

  const monthExpenses = filterExpensesForCurrentMonth(expenses);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const monthlyTotal = getMonthlyTotal(monthExpenses);
  const categoriesWithSpending = expenseCategories.filter(
    (category) => categoryTotals[category] > 0,
  );
  const hasMonthlyData =
    status === "success" && categoriesWithSpending.length > 0;

  // Donut chart logic
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.159

  let accumulatedPercent = 0;
  const donutSlices = categoriesWithSpending.map((category) => {
    const value = categoryTotals[category];
    const percent = value / (monthlyTotal || 1);
    const strokeLength = percent * circumference;
    const strokeOffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      category,
      value,
      percent,
      strokeLength,
      strokeOffset,
    };
  });

  async function handleGenerateSummary() {
    setAiError(null);
    setAiSummary(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenses: monthExpenses,
          previousMonthExpenses: filterExpensesForPreviousMonth(expenses),
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "יצירת הסיכום נכשלה.";
        setAiError(errorMessage);
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("summary" in data) ||
        typeof data.summary !== "string" ||
        data.summary.trim().length === 0
      ) {
        setAiError("תשובת הסיכום לא תקינה.");
        return;
      }

      setAiSummary(data.summary.trim());
    } catch {
      setAiError("יצירת הסיכום נכשלה. בדקו את החיבור ונסו שוב.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section
      aria-labelledby="monthly-summary-heading"
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl shadow-black/20"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2
            id="monthly-summary-heading"
            className="text-lg font-semibold text-white/90"
          >
            סיכום חודשי
          </h2>
          <p className="mt-1 text-sm text-white/50">{getCurrentMonthLabel()}</p>
        </div>

        {hasMonthlyData ? (
          <div className="text-right sm:text-left">
            <p className="text-xs text-white/60">סה״כ הוצאות חודשי</p>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(monthlyTotal)}
            </p>
          </div>
        ) : null}
      </div>

      {status === "loading" ? <LoadingState /> : null}

      {status === "error" ? (
        <ErrorState
          message={error ?? "משהו השתבש בעת טעינת נתוני הסיכום."}
          onRetry={() => router.refresh()}
        />
      ) : null}

      {status === "empty" ? <EmptyState /> : null}

      {status === "success" && categoriesWithSpending.length === 0 ? (
        <EmptyState />
      ) : null}

      {hasMonthlyData ? (
        <>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-6">
            {/* SVG Donut Chart Column */}
            <div className="w-full md:w-auto flex justify-center py-2 shrink-0">
              <div className="relative flex items-center justify-center w-48 h-48 select-none">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full transform -rotate-90"
                >
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="stroke-white/5 fill-transparent"
                    strokeWidth="12"
                  />
                  
                  {/* Slices */}
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <circle
                        key={slice.category}
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke={categoryColors[slice.category]}
                        strokeWidth={isHovered ? "16" : "12"}
                        strokeDasharray={`${slice.strokeLength} ${circumference - slice.strokeLength}`}
                        strokeDashoffset={slice.strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.02]"
                        style={{
                          transform: isHovered ? "scale(1.02)" : "scale(1)",
                          transformOrigin: "60px 60px"
                        }}
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  {hoveredCategory ? (
                    <>
                      <span className="text-xs text-white/50 font-medium">
                        {formatCategory(hoveredCategory)}
                      </span>
                      <span className="text-lg font-bold text-white mt-0.5">
                        {formatCurrency(categoryTotals[hoveredCategory])}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold mt-0.5">
                        {((categoryTotals[hoveredCategory] / monthlyTotal) * 100).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-white/50 font-medium">סה״כ החודש</span>
                      <span className="text-xl font-extrabold text-white mt-0.5">
                        {formatCurrency(monthlyTotal)}
                      </span>
                      <span className="text-[10px] text-white/40 mt-0.5">
                        {categoriesWithSpending.length} קטגוריות
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Categories List Column with progress bars */}
            <div className="flex-1 w-full">
              <ul className="grid gap-3 sm:grid-cols-2">
                {categoriesWithSpending.map((category) => {
                  const amount = categoryTotals[category];
                  const percentage = (amount / (monthlyTotal || 1)) * 100;
                  const isHovered = hoveredCategory === category;
                  return (
                    <li
                      key={category}
                      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                        isHovered
                          ? "border-white/30 bg-white/10 scale-[1.01] shadow-lg shadow-black/10"
                          : "border-white/10 bg-white/5"
                      }`}
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${categoryDots[category]}`} />
                          <span className="text-sm font-medium text-white/80">
                            {formatCategory(category)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-[10px] text-white/40 mt-0.5">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: categoryColors[category],
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white/90">
                  תובנות AI
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  קבלו סיכום קצר בשפה טבעית על ההוצאות החודש.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? "מנתח הוצאות..." : "צור סיכום AI"}
              </button>
            </div>

            {isGenerating ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-sm text-white/60 animate-pulse"
              >
                מנתח את ההוצאות שלך...
              </p>
            ) : null}

            {aiError ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3"
              >
                <p className="text-sm text-red-200">{aiError}</p>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  נסה שוב
                </button>
              </div>
            ) : null}

            {aiSummary ? (
              <div
                role="status"
                className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 text-white/80 text-sm leading-relaxed"
              >
                {renderFormattedSummary(aiSummary)}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
