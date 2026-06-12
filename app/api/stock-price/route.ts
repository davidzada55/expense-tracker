import { NextResponse } from "next/server";

import { fetchStockPrice } from "@/lib/stock-price";

type CachedQuote = {
  data: {
    price: number;
    change: number;
    changePercent: number;
  };
  expiresAt: number;
};

const quoteCache = new Map<string, CachedQuote>();
const CACHE_TTL_MS = 60_000;

function getCachedQuote(symbol: string): CachedQuote["data"] | null {
  const cached = quoteCache.get(symbol);

  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    quoteCache.delete(symbol);
    return null;
  }

  return cached.data;
}

function setCachedQuote(symbol: string, data: CachedQuote["data"]): void {
  quoteCache.set(symbol, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "חסר פרמטר symbol." }, { status: 400 });
  }

  const cached = getCachedQuote(symbol);
  if (cached) {
    return NextResponse.json(cached);
  }

  const quote = await fetchStockPrice(symbol);

  if (!quote) {
    return NextResponse.json(
      { error: "לא ניתן לטעון מחיר עבור המניה." },
      { status: 502 },
    );
  }

  setCachedQuote(symbol, quote);
  return NextResponse.json(quote);
}
