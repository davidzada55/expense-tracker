import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { buildSummaryPrompt } from "@/lib/summary-prompt";
import { summaryRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה חייב להיות JSON תקין." }, { status: 400 });
  }

  const parsed = summaryRequestSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "בקשת סיכום לא תקינה." },
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
    const prompt = buildSummaryPrompt(parsed.data);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const summary = response.text?.trim() ?? "";

    if (!summary) {
      return NextResponse.json(
        { error: "תשובת ה-AI לא כללה טקסט סיכום." },
        { status: 502 },
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "יצירת הסיכום נכשלה.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
