export type StockPriceQuote = {
  price: number;
  change: number;
  changePercent: number;
};

type AlphaVantageGlobalQuote = {
  "Global Quote"?: {
    "05. price"?: string;
    "09. change"?: string;
    "10. change percent"?: string;
  };
};

function parseChangePercent(raw: string | undefined): number {
  if (!raw) {
    return 0;
  }

  const normalized = raw.replace("%", "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchStockPrice(
  symbol: string,
): Promise<StockPriceQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GLOBAL_QUOTE");
  url.searchParams.set("symbol", symbol.toUpperCase());
  url.searchParams.set("apikey", apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AlphaVantageGlobalQuote;
    const quote = data["Global Quote"];

    if (!quote?.["05. price"]) {
      return null;
    }

    const price = Number.parseFloat(quote["05. price"]);
    const change = Number.parseFloat(quote["09. change"] ?? "0");
    const changePercent = parseChangePercent(quote["10. change percent"]);

    if (!Number.isFinite(price)) {
      return null;
    }

    return {
      price,
      change: Number.isFinite(change) ? change : 0,
      changePercent,
    };
  } catch {
    return null;
  }
}
