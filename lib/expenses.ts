import { expenseCategories } from "@/lib/schemas";
import type { Expense, ExpenseCategory } from "@/lib/types";

type ExpenseLike = Pick<Expense, "amount" | "category">;

export function filterExpensesForCurrentMonth(expenses: Expense[]): Expense[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return expenses.filter((expense) => {
    const expenseDate = new Date(`${expense.date}T00:00:00`);
    return (
      expenseDate.getFullYear() === currentYear &&
      expenseDate.getMonth() === currentMonth
    );
  });
}

export function filterExpensesForPreviousMonth(expenses: Expense[]): Expense[] {
  const now = new Date();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth();

  return expenses.filter((expense) => {
    const expenseDate = new Date(`${expense.date}T00:00:00`);
    return (
      expenseDate.getFullYear() === previousYear &&
      expenseDate.getMonth() === previousMonth
    );
  });
}

export function getCategoryTotals(
  expenses: ExpenseLike[],
): Record<ExpenseCategory, number> {
  const totals = Object.fromEntries(
    expenseCategories.map((category) => [category, 0]),
  ) as Record<ExpenseCategory, number>;

  for (const expense of expenses) {
    totals[expense.category] += expense.amount;
  }

  return totals;
}

export function getMonthlyTotal(expenses: ExpenseLike[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}
