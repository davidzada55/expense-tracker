"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteStock } from "@/app/actions/stocks";
import { AddStockForm } from "@/components/stocks/AddStockForm";
import { PortfolioSummary } from "@/components/stocks/PortfolioSummary";
import { PriceAlerts } from "@/components/stocks/PriceAlerts";
import { StockList } from "@/components/stocks/StockList";
import { getDirectionLabel } from "@/lib/price-alerts";
import {
  enrichStockWithPrice,
  formatUsd,
  type Stock,
  type StockWithPrice,
} from "@/lib/stocks";
import type { Expense } from "@/lib/types";
import type { PriceAlert } from "@/lib/price-alerts";

type StocksPageClientProps = {
  stocks: Stock[];
  alerts: PriceAlert[];
  monthlyExpenses: Expense[];
  error?: string;
};

type PriceQuote = {
  price: number;
  change: number;
  changePercent: number;
};

const ALERT_POLL_INTERVAL_MS = 60 * 60 * 1000;

export function StocksPageClient({
  stocks,
  alerts,
  monthlyExpenses,
  error,
}: StocksPageClientProps) {
  const router = useRouter();
  const [pricesBySymbol, setPricesBySymbol] = useState<
    Record<string, PriceQuote | null>
  >({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      if (stocks.length === 0) {
        setPricesBySymbol({});
        setIsLoadingPrices(false);
        return;
      }

      setIsLoadingPrices(true);

      const uniqueSymbols = Array.from(
        new Set(stocks.map((stock) => stock.symbol)),
      );
      const entries = await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `/api/stock-price?symbol=${encodeURIComponent(symbol)}`,
            );
            const data: unknown = await response.json();

            if (
              !response.ok ||
              typeof data !== "object" ||
              data === null ||
              !("price" in data) ||
              typeof data.price !== "number"
            ) {
              return [symbol, null] as const;
            }

            return [
              symbol,
              {
                price: data.price,
                change:
                  "change" in data && typeof data.change === "number"
                    ? data.change
                    : 0,
                changePercent:
                  "changePercent" in data &&
                  typeof data.changePercent === "number"
                    ? data.changePercent
                    : 0,
              },
            ] as const;
          } catch {
            return [symbol, null] as const;
          }
        }),
      );

      if (!cancelled) {
        setPricesBySymbol(Object.fromEntries(entries));
        setIsLoadingPrices(false);
      }
    }

    void loadPrices();

    return () => {
      cancelled = true;
    };
  }, [stocks]);

  useEffect(() => {
    async function checkAlerts() {
      try {
        const response = await fetch("/api/check-alerts");
        const data: unknown = await response.json();

        if (
          !response.ok ||
          typeof data !== "object" ||
          data === null ||
          !("triggered" in data) ||
          !Array.isArray(data.triggered)
        ) {
          return;
        }

        const messages = data.triggered
          .filter(
            (alert): alert is PriceAlert =>
              typeof alert === "object" &&
              alert !== null &&
              "symbol" in alert &&
              "direction" in alert &&
              "target_price" in alert,
          )
          .map(
            (alert) =>
              `🔔 התראה: ${alert.symbol} ${getDirectionLabel(alert.direction)} ${formatUsd(alert.target_price)}`,
          );

        if (messages.length > 0) {
          setToastMessages((current) => [...messages, ...current]);
          router.refresh();
        }
      } catch {
        // Ignore polling errors silently.
      }
    }

    void checkAlerts();
    const intervalId = window.setInterval(() => {
      void checkAlerts();
    }, ALERT_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  const stocksWithPrices = useMemo<StockWithPrice[]>(() => {
    return stocks.map((stock) =>
      enrichStockWithPrice(stock, pricesBySymbol[stock.symbol] ?? null),
    );
  }, [pricesBySymbol, stocks]);

  function handleDeleteStock(id: string) {
    startTransition(async () => {
      await deleteStock(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/20 px-5 py-4 text-red-200"
        >
          {error}
        </div>
      ) : null}

      {toastMessages.length > 0 ? (
        <div className="space-y-2">
          {toastMessages.map((message, index) => (
            <div
              key={`${message}-${index}`}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-3 text-emerald-200"
            >
              {message}
            </div>
          ))}
        </div>
      ) : null}

      <PortfolioSummary
        stocks={stocksWithPrices}
        monthlyExpenses={monthlyExpenses}
        isLoadingPrices={isLoadingPrices}
      />

      <AddStockForm />

      <StockList
        stocks={stocksWithPrices}
        isLoadingPrices={isLoadingPrices}
        onDelete={handleDeleteStock}
      />

      <PriceAlerts alerts={alerts} stockSymbols={stocks.map((stock) => stock.symbol)} />
    </div>
  );
}
