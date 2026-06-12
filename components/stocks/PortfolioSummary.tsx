"use client";

import { useState } from "react";

import {
  formatUsd,
  getPortfolioTotals,
  type StockWithPrice,
} from "@/lib/stocks";
import type { Expense } from "@/lib/types";

type PortfolioSummaryProps = {
  stocks: StockWithPrice[];
  monthlyExpenses: Expense[];
  isLoadingPrices: boolean;
};

export function PortfolioSummary({
  stocks,
  monthlyExpenses,
  isLoadingPrices,
}: PortfolioSummaryProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totals = getPortfolioTotals(stocks);
  const profitClass =
    totals.totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400";

  async function handleAnalyzePortfolio() {
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/portfolio-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stocks,
          expenses: monthlyExpenses,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "לא ניתן לנתח כרגע, נסה שוב";
        setAnalysisError(message);
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("analysis" in data) ||
        typeof data.analysis !== "string" ||
        data.analysis.trim().length === 0
      ) {
        setAnalysisError("לא ניתן לנתח כרגע, נסה שוב");
        return;
      }

      setAnalysis(data.analysis.trim());
    } catch {
      setAnalysisError("לא ניתן לנתח כרגע, נסה שוב");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white/90">סיכום תיק</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-white/60">שווי תיק</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {isLoadingPrices ? "..." : formatUsd(totals.totalValue)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-white/60">סך השקעה</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatUsd(totals.totalInvested)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-white/60">רווח / הפסד</p>
          <p className={`mt-1 text-2xl font-bold ${profitClass}`}>
            {isLoadingPrices
              ? "..."
              : `${formatUsd(totals.totalProfitLoss)} (${totals.totalProfitLossPercent.toFixed(1)}%)`}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={handleAnalyzePortfolio}
          disabled={isAnalyzing || stocks.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? "מנתח את התיק שלך..." : "נתח תיק עם AI 🤖"}
        </button>

        {isAnalyzing ? (
          <p className="mt-4 text-sm text-white/60 animate-pulse">
            מנתח את התיק שלך...
          </p>
        ) : null}

        {analysisError ? (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {analysisError}
          </p>
        ) : null}

        {analysis ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
            {analysis}
          </div>
        ) : null}
      </div>
    </section>
  );
}
