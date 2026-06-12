import { z } from "zod";

export type Stock = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
};

export type StockWithPrice = Stock & {
  currentPrice: number | null;
  change: number | null;
  changePercent: number | null;
  value: number | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
};

export const stockInputSchema = z.object({
  symbol: z
    .string({ required_error: "יש להזין סימול מניה" })
    .trim()
    .min(1, "יש להזין סימול מניה")
    .max(10, "סימול המניה ארוך מדי")
    .transform((value) => value.toUpperCase()),
  name: z
    .string({ required_error: "יש להזין שם חברה" })
    .trim()
    .min(1, "יש להזין שם חברה"),
  quantity: z.coerce
    .number({
      required_error: "יש להזין כמות",
      invalid_type_error: "הכמות חייבת להיות מספר",
    })
    .positive("הכמות חייבת להיות גדולה מאפס"),
  purchase_price: z.coerce
    .number({
      required_error: "יש להזין מחיר רכישה",
      invalid_type_error: "מחיר הרכישה חייב להיות מספר",
    })
    .positive("מחיר הרכישה חייב להיות גדול מאפס"),
  purchase_date: z
    .string({ required_error: "יש להזין תאריך רכישה" })
    .date("התאריך חייב להיות בפורמט YYYY-MM-DD"),
});

export type StockInput = z.infer<typeof stockInputSchema>;
export type StockFormInput = z.input<typeof stockInputSchema>;

export const stockIdSchema = z.string().uuid("מזהה המניה חייב להיות UUID תקין");

export function enrichStockWithPrice(
  stock: Stock,
  priceData: { price: number; change: number; changePercent: number } | null,
): StockWithPrice {
  if (!priceData) {
    return {
      ...stock,
      currentPrice: null,
      change: null,
      changePercent: null,
      value: null,
      profitLoss: null,
      profitLossPercent: null,
    };
  }

  const value = stock.quantity * priceData.price;
  const invested = stock.quantity * stock.purchase_price;
  const profitLoss = value - invested;
  const profitLossPercent =
    invested > 0 ? (profitLoss / invested) * 100 : null;

  return {
    ...stock,
    currentPrice: priceData.price,
    change: priceData.change,
    changePercent: priceData.changePercent,
    value,
    profitLoss,
    profitLossPercent,
  };
}

export function getPortfolioTotals(stocks: StockWithPrice[]) {
  const pricedStocks = stocks.filter((stock) => stock.currentPrice !== null);

  const totalValue = pricedStocks.reduce(
    (sum, stock) => sum + (stock.value ?? 0),
    0,
  );
  const totalInvested = stocks.reduce(
    (sum, stock) => sum + stock.quantity * stock.purchase_price,
    0,
  );
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent =
    totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercent,
    hasPrices: pricedStocks.length > 0,
  };
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}
