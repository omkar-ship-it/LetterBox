import { NextResponse } from "next/server";
import { composeWithAI } from "@/lib/ai";
import { SCENE_QUOTE_MAX_LENGTH } from "@/lib/schemas";

type ComposeSceneResult = { quote: string };

function mockedScene(recipientName: string): ComposeSceneResult {
  return {
    quote: `${recipientName}, this is the part I remember most.`.slice(0, SCENE_QUOTE_MAX_LENGTH),
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone : "warm";
  const context = typeof body?.context === "string" ? body.context.trim() : "";
  const eyebrow = typeof body?.eyebrow === "string" ? body.eyebrow.trim() : "";

  if (!recipientName) {
    return NextResponse.json({ error: "recipientName is required" }, { status: 400 });
  }

  const text = await composeWithAI(
    [
      `Write one postcard-style quote (max ${SCENE_QUOTE_MAX_LENGTH} characters, no quotation marks) for a single`,
      `scene inside a ${tone} appreciation letter addressed to ${recipientName}.`,
      eyebrow ? `This scene is labeled "${eyebrow}" — write about that specifically.` : `No specific moment was given — keep it warm and general.`,
      context ? `Overall context from the sender about the letter: "${context}".` : ``,
      `Keep it short enough to fit on a small card — favor a few punchy words over a full paragraph.`,
      `Respond with ONLY raw JSON, no markdown fences, no preamble: {"quote": "..."}`,
    ]
      .filter(Boolean)
      .join(" "),
    150
  );

  if (text) {
    try {
      const parsed = JSON.parse(text.replace(/^```(json)?/i, "").replace(/```$/, "").trim());
      if (typeof parsed.quote === "string") {
        return NextResponse.json({
          quote: parsed.quote.slice(0, SCENE_QUOTE_MAX_LENGTH),
        } satisfies ComposeSceneResult);
      }
    } catch {
      // Fall through to the mocked draft below — a bad AI response shouldn't block the wizard.
    }
  }

  return NextResponse.json(mockedScene(recipientName));
}
