import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { POST } from "../app/api/summary/route";

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

async function verifyValidation(): Promise<void> {
  console.log("Verifying summary API validation...");

  const response = await POST(
    new Request("http://localhost/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expenses: [] }),
    }),
  );

  const data: unknown = await response.json();

  if (response.status !== 400) {
    throw new Error(`Expected 400 for empty expenses, received ${response.status}.`);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("error" in data) ||
    typeof data.error !== "string"
  ) {
    throw new Error("Expected an error payload for invalid request.");
  }

  console.log(`  validation: pass (${data.error})`);
}

async function verifyMissingKeyHandling(): Promise<void> {
  console.log("Verifying missing API key handling...");

  const originalKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  const response = await POST(
    new Request("http://localhost/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expenses: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            amount: 42,
            category: "food",
            date: "2026-06-10",
            note: null,
          },
        ],
      }),
    }),
  );

  if (originalKey) {
    process.env.ANTHROPIC_API_KEY = originalKey;
  }

  if (response.status !== 500) {
    throw new Error(`Expected 500 without API key, received ${response.status}.`);
  }

  console.log("  missing key handling: pass");
}

async function verifyLiveSummary(): Promise<void> {
  console.log("Verifying live summary generation...");

  const response = await POST(
    new Request("http://localhost/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expenses: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            amount: 820,
            category: "food",
            date: "2026-06-10",
            note: "Groceries",
          },
          {
            id: "22222222-2222-4222-8222-222222222222",
            amount: 3200,
            category: "housing",
            date: "2026-06-01",
            note: "Rent",
          },
        ],
        previousMonthExpenses: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            amount: 3500,
            category: "housing",
            date: "2026-05-01",
            note: "Rent",
          },
        ],
      }),
    }),
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Unknown error";
    throw new Error(`Live summary request failed: ${message}`);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("summary" in data) ||
    typeof data.summary !== "string" ||
    data.summary.trim().length === 0
  ) {
    throw new Error("Live summary response did not include summary text.");
  }

  console.log(`  live summary: pass (${data.summary.slice(0, 80)}...)`);
}

async function main(): Promise<void> {
  loadEnvLocal();

  await verifyValidation();
  await verifyMissingKeyHandling();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "Skipping live summary check: ANTHROPIC_API_KEY is not set.",
    );
    return;
  }

  await verifyLiveSummary();
  console.log("Summary API checks passed.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Summary verification failed: ${message}`);
  process.exitCode = 1;
});
