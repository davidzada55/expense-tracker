import {
  getBonusTitle,
  getGoalForMonth,
  type SavingsGoal,
} from "../lib/goals";

const testGoal: SavingsGoal = {
  id: "test",
  baseGoal: 1000,
  monthlyGrowthPercent: 5,
  startMonth: "2026-01",
  currency: "ILS",
};

const cases = [
  { month: "2026-01", expected: 1000 },
  { month: "2026-02", expected: 1050 },
  { month: "2026-04", expected: 1158 },
];

let passed = 0;

for (const testCase of cases) {
  const actual = getGoalForMonth(testGoal, testCase.month);
  const ok = actual === testCase.expected;
  console.log(
    `${testCase.month}: ${actual} ${ok ? "✓" : `✗ expected ${testCase.expected}`}`,
  );
  if (ok) passed += 1;
}

console.log(`Bonus 100%: ${getBonusTitle(100)}`);
console.log(`Bonus 125%: ${getBonusTitle(125)}`);
console.log(`Bonus 160%: ${getBonusTitle(160)}`);

if (passed !== cases.length) {
  process.exit(1);
}

console.log("All goal formula checks passed.");
