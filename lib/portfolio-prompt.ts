import { getCategoryTotals, getMonthlyTotal } from "@/lib/expenses";
import { formatCategory, formatCurrency } from "@/lib/format";
import { formatUsd, getPortfolioTotals, type StockWithPrice } from "@/lib/stocks";
import type { Expense } from "@/lib/types";

export function buildPortfolioPrompt(
  stocks: StockWithPrice[],
  monthlyExpenses: Expense[],
): string {
  const totals = getPortfolioTotals(stocks);
  const monthlyTotal = getMonthlyTotal(monthlyExpenses);
  const categoryTotals = getCategoryTotals(monthlyExpenses);
  const topCategories = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);

  const stockLines = stocks
    .map((stock) => {
      const currentPrice =
        stock.currentPrice !== null ? formatUsd(stock.currentPrice) : "לא זמין";
      const profitLossPercent =
        stock.profitLossPercent !== null
          ? `${stock.profitLossPercent.toFixed(1)}%`
          : "לא זמין";

      return `- ${stock.symbol} (${stock.name}): כמות ${stock.quantity}, מחיר רכישה ${formatUsd(stock.purchase_price)}, מחיר נוכחי ${currentPrice}, רווח/הפסד ${profitLossPercent}`;
    })
    .join("\n");

  const categoryLines =
    topCategories.length > 0
      ? topCategories
          .map(
            ([category, amount]) =>
              `- ${formatCategory(category as Expense["category"])}: ${formatCurrency(amount)}`,
          )
          .join("\n")
      : "אין הוצאות חודשיות";

  const monthsOfCoverage =
    monthlyTotal > 0 ? (totals.totalValue / monthlyTotal).toFixed(1) : "לא ניתן לחשב";

  return [
    "כתוב בדיוק 5 משפטים בעברית שמנתחים את תיק ההשקעות וההוצאות החודשיות של המשתמש.",
    "משפט 1: מצב כללי של התיק (רווח/הפסד).",
    "משפט 2: המניה עם הביצועים הטובים ביותר.",
    "משפט 3: המניה החלשה או המסוכנת ביותר.",
    "משפט 4: יחס בין שווי התיק להוצאות החודש (חודשי כיסוי).",
    "משפט 5: המלצה מעשית אחת וקונקרטית.",
    "",
    `שווי תיק כולל: ${formatUsd(totals.totalValue)}`,
    `סך השקעה: ${formatUsd(totals.totalInvested)}`,
    `רווח/הפסד כולל: ${formatUsd(totals.totalProfitLoss)} (${totals.totalProfitLossPercent.toFixed(1)}%)`,
    `סך הוצאות חודשיות: ${formatCurrency(monthlyTotal)}`,
    `חודשי כיסוי משוערים: ${monthsOfCoverage}`,
    "",
    "מניות בתיק:",
    stockLines || "אין מניות",
    "",
    "3 קטגוריות הוצאה מובילות:",
    categoryLines,
  ].join("\n");
}
