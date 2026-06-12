"use client";

import { useTransition } from "react";

import { formatUsd, type StockWithPrice } from "@/lib/stocks";
import { formatDate } from "@/lib/format";

type StockItemProps = {
  stock: StockWithPrice;
  isLoadingPrice: boolean;
  onDelete: (id: string) => void;
};

export function StockItem({
  stock,
  isLoadingPrice,
  onDelete,
}: StockItemProps) {
  const [isPending, startTransition] = useTransition();

  const profitClass =
    stock.profitLoss !== null && stock.profitLoss >= 0
      ? "text-emerald-400"
      : "text-red-400";

  function handleDelete() {
    startTransition(() => {
      onDelete(stock.id);
    });
  }

  return (
    <li className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 last:rounded-b-2xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
          {stock.symbol}
        </span>

        <div className="min-w-0">
          <p className="font-medium text-white">{stock.name}</p>
          <p className="mt-1 text-sm text-white/60">
            {stock.quantity} יחידות · רכישה {formatUsd(stock.purchase_price)} ·{" "}
            {formatDate(stock.purchase_date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left">
          {isLoadingPrice || stock.currentPrice === null ? (
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <>
              <p className="text-base font-semibold text-white">
                {formatUsd(stock.currentPrice)}
              </p>
              <p className={`mt-0.5 text-sm font-medium ${profitClass}`}>
                {stock.profitLoss !== null && stock.profitLossPercent !== null
                  ? `${formatUsd(stock.profitLoss)} (${stock.profitLossPercent.toFixed(1)}%)`
                  : "—"}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`מחק מניה ${stock.symbol}`}
          className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
        >
          {isPending ? "..." : "מחק"}
        </button>
      </div>
    </li>
  );
}
