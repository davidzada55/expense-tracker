import { z } from "zod";

export const expenseCategories = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "investments",
  "other",
] as const;

export const expenseInputSchema = z.object({
  amount: z.coerce
    .number({
      required_error: "יש להזין סכום",
      invalid_type_error: "הסכום חייב להיות מספר",
    })
    .positive("הסכום חייב להיות גדול מאפס")
    .max(99_999_999.99, "הסכום גדול מדי"),
  category: z.enum(expenseCategories, {
    required_error: "יש לבחור קטגוריה",
    invalid_type_error: "קטגוריה לא תקינה",
  }),
  date: z
    .string({
      required_error: "יש להזין תאריך",
    })
    .date("התאריך חייב להיות בפורמט YYYY-MM-DD"),
  note: z
    .string()
    .trim()
    .max(500, "הערה יכולה להכיל עד 500 תווים")
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value ?? null)),
});

export const expenseIdSchema = z.string().uuid("מזהה ההוצאה חייב להיות UUID תקין");

export const summaryExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  category: z.enum(expenseCategories),
  date: z.string().date(),
  note: z.string().nullable(),
  created_at: z.string().optional(),
});

export const summaryRequestSchema = z.object({
  expenses: z
    .array(summaryExpenseSchema)
    .min(1, "נדרשת לפחות הוצאה אחת לחודש זה."),
  previousMonthExpenses: z.array(summaryExpenseSchema).default([]),
});

export const summaryResponseSchema = z.object({
  summary: z.string().min(1),
});
