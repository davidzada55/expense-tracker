"use server";

import { revalidatePath } from "next/cache";

import {
  priceAlertIdSchema,
  priceAlertInputSchema,
  type PriceAlert,
} from "@/lib/price-alerts";
import { getSupabase } from "@/lib/supabase";

export type AlertActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function normalizeAlert(row: PriceAlert): PriceAlert {
  return {
    id: row.id,
    symbol: row.symbol,
    target_price: Number(row.target_price),
    direction: row.direction,
    triggered: row.triggered,
    triggered_at: row.triggered_at,
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

export async function getAlerts(): Promise<AlertActionResult<PriceAlert[]>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("price_alerts" as never)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: ((data ?? []) as PriceAlert[]).map(normalizeAlert),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "טעינת ההתראות נכשלה.",
    };
  }
}

export async function addAlert(
  input: unknown,
): Promise<AlertActionResult<PriceAlert>> {
  const parsed = priceAlertInputSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "קלט התראה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("price_alerts" as never)
      .insert(parsed.data as never)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "ההתראה לא נוצרה." };
    }

    revalidateStocksPage();

    return {
      success: true,
      data: normalizeAlert(data as PriceAlert),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "הוספת ההתראה נכשלה.",
    };
  }
}

export async function deleteAlert(
  id: string,
): Promise<AlertActionResult<{ id: string }>> {
  const parsed = priceAlertIdSchema.safeParse(id);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "מזהה התראה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("price_alerts" as never)
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
        error instanceof Error ? error.message : "מחיקת ההתראה נכשלה.",
    };
  }
}

export async function markAlertTriggered(
  id: string,
): Promise<AlertActionResult<PriceAlert>> {
  const parsed = priceAlertIdSchema.safeParse(id);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "מזהה התראה לא תקין.",
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("price_alerts" as never)
      .update({
        triggered: true,
        triggered_at: new Date().toISOString(),
      } as never)
      .eq("id", parsed.data)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "ההתראה לא עודכנה." };
    }

    revalidateStocksPage();

    return {
      success: true,
      data: normalizeAlert(data as PriceAlert),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "עדכון ההתראה נכשל.",
    };
  }
}
