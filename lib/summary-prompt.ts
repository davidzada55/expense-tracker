import { formatCategory, formatCurrency } from "@/lib/format";
import {
  getCategoryTotals,
  getMonthlyTotal,
} from "@/lib/expenses";
import type { summaryRequestSchema } from "@/lib/schemas";
import type { ExpenseCategory } from "@/lib/types";
import type { z } from "zod";

type SummaryRequest = z.infer<typeof summaryRequestSchema>;

function formatExpenseList(
  expenses: SummaryRequest["expenses"],
): string {
  if (expenses.length === 0) {
    return "לא נרשמו הוצאות.";
  }

  return expenses
    .map((expense) => {
      const noteSuffix = expense.note ? ` — הערה: ${expense.note}` : "";
      return `- ${formatCategory(expense.category)}: ${formatCurrency(expense.amount)} בתאריך ${expense.date}${noteSuffix}`;
    })
    .join("\n");
}

export function buildSummaryPrompt(data: SummaryRequest): string {
  const currentTotals = getCategoryTotals(data.expenses);
  const currentTotal = getMonthlyTotal(data.expenses);
  const previousTotal = getMonthlyTotal(data.previousMonthExpenses);
  const topCategoryEntry = Object.entries(currentTotals).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const topCategory = topCategoryEntry
    ? (topCategoryEntry[0] as ExpenseCategory)
    : null;
  const topCategoryTotal = topCategoryEntry?.[1] ?? 0;
  const largestExpense = [...data.expenses].sort(
    (left, right) => right.amount - left.amount,
  )[0];

  return [
    "אתה יועץ פיננסי אישי חכם, חיובי ומקצועי בשם 'פיננס-בוט'. תפקידך לנתח את ההוצאות החודשיות של המשתמש ולספק לו תובנות מעמיקות, מותאמות אישית, מועילות ומעודדות בעברית רהוטה וזורמת.",
    "",
    "הנחיות חשובות לכתיבה:",
    "1. פנה למשתמש בגובה העיניים, בשפה טבעית, נעימה, חיובית ומכבדת.",
    "2. השתמש בסכומים בשקלים בלבד עם סימן ה-₪ בצד ימין (למשל: 150 ₪ ולא 150 ILS).",
    "3. חלק את התשובה שלך למקטעים ברורים עם כותרות קצרות ומודגשות בעזרת כוכביות (למשל: **ניתוח כללי:**) והשתמש ברשימות בולטים (•) כדי שיהיה קל לקרוא.",
    "4. הצע עצות מעשיות, חכמות וספציפיות המבוססות ישירות על נתוני ההוצאות שסופקו (למשל, התייחס להערות שנוספו להוצאות או להתפלגות שלהן).",
    "5. שמור על כתיבה ממוקדת ותמציתית (כ-4 עד 6 פסקאות בסך הכל) שנותנת ערך מוסף אמיתי במקום רק לחזור על הנתונים היבשים.",
    "6. לעולם אל תציג סימני שאלה או טקסט שבור. ודא שהעברית מנוסחת בצורה מושלמת.",
    "",
    "השתמש במבנה הבא לתובנות שלך:",
    "📊 **מבט על החודש הנוכחי:**",
    "ספק ניתוח חם ומעניין על ההוצאות החודשיות הכוללות והרגלי הצריכה הכלליים המשתקפים מהנתונים.",
    "",
    "🔍 **מוקדי הוצאה בולטים:**",
    "• ציין את הקטגוריה המובילה והסבר מה המשמעות שלה מתוך סך התקציב (למשל, אחוז משוער או השוואה לקטגוריות אחרות).",
    "• ציין את ההוצאה הבודדת הגבוהה ביותר החודש והתייחס להערה שלה (אם יש) כדי להפוך את זה לאישי.",
    "",
    "📈 **מגמות והשוואה לחודש שעבר:**",
    "השווה את סך ההוצאות החודש לחודש שעבר באופן איכותי וכמותי. אם ההוצאות ירדו, פרגן למשתמש! אם הן עלו, עשה זאת בצורה מעודדת ומסבירת פנים. אם אין חודש קודם (סך של 0), ציין בעדינות ובחיוך שזהו חודש הניתוח הראשון שלך איתו ושאתה מצפה להמשך הדרך המשותפת.",
    "",
    "💡 **טיפ זהב לחיסכון חכם (מותאם אישית):**",
    "תן 1-2 עצות ממוקדות ומעשיות המבוססות על ההוצאות שלו (למשל: אם יש הרבה הוצאות קטנות, אם קטגוריית 'אחר' או 'בידור' גבוהה, או כיצד להתמודד עם הוצאה גדולה ספציפית).",
    "",
    "--- נתוני המשתמש לניתוח ---",
    `סה״כ החודש הנוכחי: ${formatCurrency(currentTotal)}`,
    topCategory
      ? `קטגוריה מובילה: ${formatCategory(topCategory)} בסך ${formatCurrency(topCategoryTotal)}`
      : "קטגוריה מובילה: אין",
    largestExpense
      ? `הוצאה גדולה ביותר: ${formatCategory(largestExpense.category)} בסך ${formatCurrency(largestExpense.amount)}`
      : "הוצאה גדולה ביותר: אין",
    `סה״כ החודש הקודם: ${formatCurrency(previousTotal)}`,
    "",
    "רשימת הוצאות מפורטת לחודש הנוכחי:",
    formatExpenseList(data.expenses),
    "",
    "רשימת הוצאות מפורטת לחודש הקודם:",
    formatExpenseList(data.previousMonthExpenses),
  ].join("\n");
}
