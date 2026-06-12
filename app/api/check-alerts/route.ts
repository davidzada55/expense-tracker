import { NextResponse } from "next/server";

import { markAlertTriggered } from "@/app/actions/alerts";
import { isAlertTriggered } from "@/lib/price-alerts";
import { fetchStockPrice } from "@/lib/stock-price";
import { getSupabase } from "@/lib/supabase";
import type { PriceAlert } from "@/lib/price-alerts";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("price_alerts" as never)
      .select("*")
      .eq("triggered", false)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const alerts = (data ?? []) as PriceAlert[];
    const triggered: PriceAlert[] = [];

    for (const alert of alerts) {
      const quote = await fetchStockPrice(alert.symbol);

      if (!quote) {
        continue;
      }

      if (!isAlertTriggered(alert, quote.price)) {
        continue;
      }

      const result = await markAlertTriggered(alert.id);

      if (result.success) {
        triggered.push(result.data);
      }
    }

    return NextResponse.json({ triggered });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "בדיקת ההתראות נכשלה.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
