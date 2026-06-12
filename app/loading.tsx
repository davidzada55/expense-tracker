import { ExpenseList } from "@/components/ExpenseList";
import { MonthlySummary } from "@/components/MonthlySummary";

export default function Loading() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="h-4 w-28 animate-pulse rounded bg-stone-200" />
          <div className="mt-3 h-9 w-56 animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-stone-200" />
        </header>

        <div className="space-y-8">
          <div className="h-96 animate-pulse rounded-2xl border border-stone-200 bg-white" />
          <MonthlySummary status="loading" />
          <ExpenseList status="loading" />
        </div>
      </div>
    </main>
  );
}
