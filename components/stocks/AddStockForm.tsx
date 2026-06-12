"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addStock } from "@/app/actions/stocks";

export function AddStockForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [success]);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await addStock({
        symbol: String(formData.get("symbol") ?? ""),
        name: String(formData.get("name") ?? ""),
        quantity: String(formData.get("quantity") ?? ""),
        purchase_price: String(formData.get("purchase_price") ?? ""),
        purchase_date: String(formData.get("purchase_date") ?? ""),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      formRef.current?.reset();
      setSuccess("המניה נוספה בהצלחה.");
      router.refresh();
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white/90">הוספת מניה</h2>
        <p className="mt-1 text-sm text-white/60">
          הזינו את פרטי המניה כדי לעקוב אחר שווי התיק.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(new FormData(event.currentTarget));
        }}
        className="grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/80">סימול</span>
          <input
            name="symbol"
            required
            maxLength={10}
            placeholder="AAPL"
            className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 uppercase text-white placeholder-white/40 outline-none transition focus:border-purple-400"
            onChange={(event) => {
              event.currentTarget.value = event.currentTarget.value.toUpperCase();
            }}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/80">שם חברה</span>
          <input
            name="name"
            required
            placeholder="Apple Inc."
            className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/80">כמות</span>
          <input
            name="quantity"
            type="number"
            inputMode="decimal"
            step="0.0001"
            min="0.0001"
            required
            placeholder="10"
            className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/80">מחיר רכישה ($)</span>
          <input
            name="purchase_price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            placeholder="150.00"
            className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/40 outline-none transition focus:border-purple-400"
          />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-white/80">תאריך רכישה</span>
          <input
            name="purchase_date"
            type="date"
            required
            defaultValue={today}
            className="min-h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white outline-none transition focus:border-purple-400"
          />
        </label>

        {error ? (
          <div
            role="alert"
            className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="md:col-span-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-200"
          >
            {success}
          </div>
        ) : null}

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-11 rounded-xl bg-purple-500 px-6 py-3 font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "מוסיף..." : "הוסף מניה"}
          </button>
        </div>
      </form>
    </section>
  );
}
