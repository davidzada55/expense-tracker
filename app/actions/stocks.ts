"use server";

import { revalidatePath } from "next/cache";

import { getSupabase } from "@/lib/supabase";
import {
  stockIdSchema,
  stockInputSchema,
  type Stock,
} from "@/lib/stocks";

export type StockActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function normalizeStock(row: Stock): Stock {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    quantity: Number(row.quantity),
    purchase_price: Number(row.purchase_price),
    purchase_date: row.purchase_date,
    created_at: row.created_at,
  };
}

function revalidateStocksPage(): void {
  try {
    revalidatePath("/stocks");
  } catch {
    // No-op outside a Next.js request context.
  }
}

export async function getStocks(): Promise<StockActionResult<Stock[]>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stocks" as never)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: ((data ?? []) as Stock[]).map(normalizeStock),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "טעינת המניות נכשלה.",
    };
  }
}

export async function addStock(
  input: unknown,
): Promise<StockActionResult<Stock>> {
  const parsed = stockInputSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "קלט מניה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stocks" as never)
      .insert(parsed.data as never)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "המניה לא נוצרה." };
    }

    revalidateStocksPage();

    return {
      success: true,
      data: normalizeStock(data as Stock),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "הוספת המניה נכשלה.",
    };
  }
}

export async function deleteStock(
  id: string,
): Promise<StockActionResult<{ id: string }>> {
  const parsed = stockIdSchema.safeParse(id);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "מזהה מניה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("stocks" as never)
      .delete()
      .eq("id", parsed.data);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateStocksPage();

    return {
      success: true,
      data: { id: parsed.data },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "מחיקת המניה נכשלה.",
    };
  }
}
