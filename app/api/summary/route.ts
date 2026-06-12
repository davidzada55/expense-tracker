import Anthropic from "@anthropic-ai/sdk";
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

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "מפתח Anthropic API לא מוגדר בשרת." },
      { status: 500 },
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const prompt = buildSummaryPrompt(parsed.data);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const summary = textBlock?.type === "text" ? textBlock.text.trim() : "";

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
