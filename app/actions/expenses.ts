"use server";

import { revalidatePath } from "next/cache";

import { expenseIdSchema, expenseInputSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase";
import type { Expense } from "@/lib/types";

export type ExpenseActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function normalizeExpense(row: Expense): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    note: row.note,
    created_at: row.created_at,
  };
}

function revalidateExpensesPage(): void {
  try {
    revalidatePath("/");
  } catch {
    // No-op outside a Next.js request context (e.g. verification scripts).
  }
}

export async function getExpenses(): Promise<ExpenseActionResult<Expense[]>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data ?? []).map(normalizeExpense),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "טעינת ההוצאות נכשלה.",
    };
  }
}

export type ExpenseFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function addExpenseFormAction(
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const result = await addExpense({
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
    note: formData.get("note"),
  });

  if (!result.success) {
    return { status: "error", message: result.error };
  }

  return {
    status: "success",
    message: "ההוצאה נוספה בהצלחה.",
  };
}

export async function addExpense(
  input: unknown,
): Promise<ExpenseActionResult<Expense>> {
  const parsed = expenseInputSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "קלט הוצאה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "ההוצאה לא נוצרה." };
    }

    revalidateExpensesPage();

    return {
      success: true,
      data: normalizeExpense(data),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "הוספת ההוצאה נכשלה.",
    };
  }
}

export async function deleteExpense(
  id: string,
): Promise<ExpenseActionResult<{ id: string }>> {
  const parsed = expenseIdSchema.safeParse(id);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "מזהה הוצאה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", parsed.data);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateExpensesPage();

    return {
      success: true,
      data: { id: parsed.data },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "מחיקת ההוצאה נכשלה.",
    };
  }
}
