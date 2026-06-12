"use client";

import { StockItem } from "@/components/stocks/StockItem";
import type { StockWithPrice } from "@/lib/stocks";

type StockListProps = {
  stocks: StockWithPrice[];
  isLoadingPrices: boolean;
  onDelete: (id: string) => void;
};

export function StockList({
  stocks,
  isLoadingPrices,
  onDelete,
}: StockListProps) {
  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white/90">המניות שלי</h2>
        <p className="mt-1 text-sm text-white/60">
          {stocks.length === 0 ? "אין מניות בתיק" : `${stocks.length} מניות`}
        </p>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-8 text-center text-white/70">
          הוסיפו מניה ראשונה כדי להתחיל לעקוב אחר התיק.
        </div>
      ) : (
        <ul className="divide-y divide-white/10 border-t border-white/10 -mx-6 -mb-6 mt-4">
          {stocks.map((stock) => (
            <StockItem
              key={stock.id}
              stock={stock}
              isLoadingPrice={isLoadingPrices}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
