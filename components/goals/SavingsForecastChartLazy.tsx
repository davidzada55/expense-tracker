"use client";

import dynamic from "next/dynamic";

import type { SavingsGoal } from "@/lib/goals";

const Chart = dynamic(
  () =>
    import("@/components/goals/SavingsForecastChart").then(
      (mod) => mod.SavingsForecastChart,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        טוען גרף...
      </section>
    ),
  },
);

type SavingsForecastChartLazyProps = {
  goal: SavingsGoal;
};

export function SavingsForecastChartLazy({ goal }: SavingsForecastChartLazyProps) {
  return <Chart goal={goal} />;
}
