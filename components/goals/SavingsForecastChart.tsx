"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSavingsForecast, type SavingsGoal } from "@/lib/goals";
import { formatGoalCurrency } from "@/lib/currency";

type SavingsForecastChartProps = {
  goal: SavingsGoal;
};

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

function getHebrewMonthLabel(monthKey: string): string {
  const monthIndex = Number(monthKey.split("-")[1]) - 1;
  return HEBREW_MONTHS[monthIndex] ?? monthKey;
}

export function SavingsForecastChart({ goal }: SavingsForecastChartProps) {
  const forecast = getSavingsForecast(goal, 6).map((item) => ({
    ...item,
    label: getHebrewMonthLabel(item.month),
  }));

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20">
      <h2 className="text-lg font-bold text-white">
        צפי חיסכון — 6 חודשים הבאים 📈
      </h2>
      <p className="mt-1 text-sm text-white/60">
        כך יגדל יעד החיסכון שלך מחודש לחודש.
      </p>

      <div className="mt-6 h-72 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forecast} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(6, 25, 18, 0.95)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value) => [
                `יעד: ${formatGoalCurrency(Number(value), goal.currency)}`,
                "יעד חודשי",
              ]}
            />
            <Bar
              dataKey="goalAmount"
              fill="#34d399"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
