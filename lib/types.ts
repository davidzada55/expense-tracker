import type { z } from "zod";

import {
  expenseCategories,
  expenseInputSchema,
} from "@/lib/schemas";

export type ExpenseCategory = (typeof expenseCategories)[number];

export type ExpenseInput = z.infer<typeof expenseInputSchema>;

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: Expense;
        Insert: {
          id?: string;
          amount: number;
          category: ExpenseCategory;
          date: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          category?: ExpenseCategory;
          date?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
