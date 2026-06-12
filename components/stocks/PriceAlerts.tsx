"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addAlert, deleteAlert } from "@/app/actions/alerts";
import {
  getDirectionLabel,
  type PriceAlert,
  type PriceAlertDirection,
} from "@/lib/price-alerts";
import { formatUsd } from "@/lib/stocks";

type PriceAlertsProps = {
  alerts: PriceAlert[];
  stockSymbols: string[];
};

export function PriceAlerts({ alerts, stockSymbols }: PriceAlertsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<PriceAlertDirection>("above");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await addAlert({
        symbol: String(formData.get("symbol") ?? ""),
        target_price: String(formData.get("target_price") ?? ""),
        direction,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAlert(id);
      router.refresh();
    });
  }

  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-white/90">התראות מחיר 🔔</h2>
          <p className="mt-1 text-sm text-white/60">
            {alerts.length === 0
              ? "אין התראות פעילות"
              : `${alerts.length} התראות`}
          </p>
        </div>
        <span className="text-white/60">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen ? (
        <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(new FormData(event.currentTarget));
            }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">סימול</span>
              {stockSymbols.length > 0 ? (
                <select
                  name="symbol"
                  required
                  defaultValue={stockSymbols[0]}
                  className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none"
                >
                  {stockSymbols.map((symbol) => (
                    <option key={symbol} value={symbol} className="bg-slate-900">
                      {symbol}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="symbol"
                  required
                  placeholder="AAPL"
                  className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 uppercase text-white placeholder-white/40 outline-none"
                  onChange={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.toUpperCase();
                  }}
                />
              )}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">מחיר יעד ($)</span>
              <input
                name="target_price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                placeholder="200.00"
                className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none"
              />
            </label>

            <div className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-white/80">
                כיוון
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("above")}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    direction === "above"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  מעל
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("below")}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    direction === "below"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  מתחת
                </button>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isPending}
                className="min-h-11 rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-400 disabled:opacity-50"
              >
                {isPending ? "שומר..." : "הגדר התראה"}
              </button>
            </div>
          </form>

          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{alert.symbol}</span>
                    {alert.triggered ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                        ✅ הופעלה
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-white/60">
                    {getDirectionLabel(alert.direction)} {formatUsd(alert.target_price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(alert.id)}
                  disabled={isPending}
                  className="rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-50"
                >
                  מחק
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
