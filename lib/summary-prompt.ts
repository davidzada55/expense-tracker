import { formatCategory, formatCurrency } from "@/lib/format";
import {
  getCategoryTotals,
  getMonthlyTotal,
} from "@/lib/expenses";
import type { summaryRequestSchema } from "@/lib/schemas";
import type { ExpenseCategory } from "@/lib/types";
import type { z } from "zod";

type SummaryRequest = z.infer<typeof summaryRequestSchema>;

function formatExpenseList(
  expenses: SummaryRequest["expenses"],
): string {
  if (expenses.length === 0) {
    return "לא נרשמו הוצאות.";
  }

  return expenses
    .map((expense) => {
      const noteSuffix = expense.note ? ` — הערה: ${expense.note}` : "";
      return `- ${formatCategory(expense.category)}: ${formatCurrency(expense.amount)} בתאריך ${expense.date}${noteSuffix}`;
    })
    .join("\n");
}

export function buildSummaryPrompt(data: SummaryRequest): string {
  const currentTotals = getCategoryTotals(data.expenses);
  const currentTotal = getMonthlyTotal(data.expenses);
  const previousTotal = getMonthlyTotal(data.previousMonthExpenses);
  const topCategoryEntry = Object.entries(currentTotals).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const topCategory = topCategoryEntry
    ? (topCategoryEntry[0] as ExpenseCategory)
    : null;
  const topCategoryTotal = topCategoryEntry?.[1] ?? 0;
  const largestExpense = [...data.expenses].sort(
    (left, right) => right.amount - left.amount,
  )[0];

  return [
    "כתוב בדיוק שלוש משפטים בעברית שמסכמים את ההוצאות החודשיות של המשתמש.",
    "השתמש בסכומים בשקלים עם סימן ₪.",
    "משפט 1: הקטגוריה עם סך ההוצאות הגבוה ביותר החודש.",
    "משפט 2: ההוצאה הבודדת הגדולה ביותר החודש.",
    "משפט 3: השווה את סך ההוצאות לחודש הקודם. אם סך החודש הקודם הוא 0, ציין שאין חודש קודם להשוואה.",
    "",
    `סה״כ החודש הנוכחי: ${formatCurrency(currentTotal)}`,
    topCategory
      ? `קטגוריה מובילה: ${formatCategory(topCategory)} בסך ${formatCurrency(topCategoryTotal)}`
      : "קטגוריה מובילה: אין",
    largestExpense
      ? `הוצאה גדולה ביותר: ${formatCategory(largestExpense.category)} בסך ${formatCurrency(largestExpense.amount)}`
      : "הוצאה גדולה ביותר: אין",
    `סה״כ החודש הקודם: ${formatCurrency(previousTotal)}`,
    "",
    "הוצאות החודש הנוכחי:",
    formatExpenseList(data.expenses),
    "",
    "הוצאות החודש הקודם:",
    formatExpenseList(data.previousMonthExpenses),
  ].join("\n");
}
