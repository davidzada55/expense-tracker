import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { expenseCategories } from "@/lib/schemas";
import { buildPortfolioPrompt } from "@/lib/portfolio-prompt";
import type { StockWithPrice } from "@/lib/stocks";
import type { Expense } from "@/lib/types";

const portfolioAnalysisSchema = z.object({
  stocks: z
    .array(
      z.object({
        id: z.string().uuid(),
        symbol: z.string().min(1),
        name: z.string().min(1),
        quantity: z.coerce.number().positive(),
        purchase_price: z.coerce.number().positive(),
        purchase_date: z.string().date(),
        created_at: z.string().optional(),
        currentPrice: z.number().nullable(),
        change: z.number().nullable(),
        changePercent: z.number().nullable(),
        value: z.number().nullable(),
        profitLoss: z.number().nullable(),
        profitLossPercent: z.number().nullable(),
      }),
    )
    .min(1, "נדרשת לפחות מניה אחת לניתוח."),
  expenses: z.array(
    z.object({
      id: z.string().uuid(),
      amount: z.coerce.number().positive(),
      category: z.enum(expenseCategories),
      date: z.string().date(),
      note: z.string().nullable(),
      created_at: z.string().optional(),
    }),
  ),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה חייב להיות JSON תקין." }, { status: 400 });
  }

  const parsed = portfolioAnalysisSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "בקשת ניתוח לא תקינה." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "מפתח Gemini API לא מוגדר בשרת." },
      { status: 500 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPortfolioPrompt(
      parsed.data.stocks as StockWithPrice[],
      parsed.data.expenses as Expense[],
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "אתה יועץ פיננסי שמנתח תיקי השקעות. ענה תמיד בעברית בלבד.",
      },
    });

    const analysis = response.text?.trim() ?? "";

    if (!analysis) {
      return NextResponse.json(
        { error: "תשובת ה-AI לא כללה טקסט ניתוח." },
        { status: 502 },
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "יצירת הניתוח נכשלה.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
