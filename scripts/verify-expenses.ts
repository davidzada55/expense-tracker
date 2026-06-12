import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  addExpense,
  deleteExpense,
  getExpenses,
} from "../app/actions/expenses";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const content = readFileSync(envPath, "utf8");

    for (const line of content.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn("Could not read .env.local; using existing environment variables.");
  }
}

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function verifyValidation(): Promise<void> {
  console.log("Verifying validation...");

  const invalidAdd = await addExpense({
    amount: -5,
    category: "food",
    date: "2026-06-12",
    note: null,
  });

  if (invalidAdd.success) {
    throw new Error("Expected negative amount to be rejected.");
  }

  console.log(`  addExpense validation: pass (${invalidAdd.error})`);

  const invalidDelete = await deleteExpense("not-a-uuid");

  if (invalidDelete.success) {
    throw new Error("Expected invalid id to be rejected.");
  }

  console.log(`  deleteExpense validation: pass (${invalidDelete.error})`);
}

async function verifyCrudCycle(): Promise<void> {
  console.log("Verifying CRUD cycle against Supabase...");

  const initial = await getExpenses();

  if (!initial.success) {
    throw new Error(`getExpenses failed: ${initial.error}`);
  }

  console.log(`  getExpenses: pass (${initial.data.length} rows)`);

  const created = await addExpense({
    amount: 42.5,
    category: "food",
    date: "2026-06-12",
    note: "Verification expense",
  });

  if (!created.success) {
    throw new Error(`addExpense failed: ${created.error}`);
  }

  console.log(`  addExpense: pass (${created.data.id})`);

  const afterAdd = await getExpenses();

  if (!afterAdd.success) {
    throw new Error(`getExpenses after add failed: ${afterAdd.error}`);
  }

  const found = afterAdd.data.some((expense) => expense.id === created.data.id);

  if (!found) {
    throw new Error("Created expense was not returned by getExpenses.");
  }

  console.log("  getExpenses after add: pass");

  const removed = await deleteExpense(created.data.id);

  if (!removed.success) {
    throw new Error(`deleteExpense failed: ${removed.error}`);
  }

  console.log(`  deleteExpense: pass (${removed.data.id})`);

  const afterDelete = await getExpenses();

  if (!afterDelete.success) {
    throw new Error(`getExpenses after delete failed: ${afterDelete.error}`);
  }

  const stillPresent = afterDelete.data.some(
    (expense) => expense.id === created.data.id,
  );

  if (stillPresent) {
    throw new Error("Deleted expense is still present in getExpenses.");
  }

  console.log("  getExpenses after delete: pass");
}

async function main(): Promise<void> {
  loadEnvLocal();

  await verifyValidation();

  if (!hasSupabaseConfig()) {
    console.log(
      "Skipping Supabase CRUD checks: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.",
    );
    return;
  }

  await verifyCrudCycle();
  console.log("All expense action checks passed.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Verification failed: ${message}`);
  process.exitCode = 1;
});
