import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type ComposeResult = { title: string; message: string };

function mockedDraft(recipientName: string, context?: string): ComposeResult {
  const trimmedContext = context?.trim();
  return {
    title: `For ${recipientName}, With Thanks`,
    message: trimmedContext
      ? `${recipientName}, I've been meaning to say this: ${trimmedContext}. Thank you — truly.`
      : `${recipientName}, I don't say this enough, so I'm saying it here: thank you for being exactly who you are.`,
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone : "warm";
  const context = typeof body?.context === "string" ? body.context : "";

  if (!recipientName) {
    return NextResponse.json({ error: "recipientName is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(mockedDraft(recipientName, context));
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            `Write a short poetic title (max 6 words, no quotation marks) and a warm opening line (1-2 sentences)`,
            `for a ${tone} appreciation letter addressed to ${recipientName}.`,
            context ? `Context from the sender about why: "${context}".` : `No extra context was given — keep it sincere and general.`,
            `Respond with ONLY raw JSON, no markdown fences, no preamble: {"title": "...", "message": "..."}`,
          ].join(" "),
        },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    const text = block && "text" in block ? block.text.trim() : "";
    const parsed = JSON.parse(text.replace(/^```(json)?/i, "").replace(/```$/, "").trim());
    if (typeof parsed.title === "string" && typeof parsed.message === "string") {
      return NextResponse.json({ title: parsed.title, message: parsed.message } satisfies ComposeResult);
    }
  } catch {
    // Fall through to the mocked draft below — a bad AI response shouldn't block the wizard.
  }

  return NextResponse.json(mockedDraft(recipientName, context));
}
