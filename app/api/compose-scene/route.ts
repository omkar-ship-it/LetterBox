import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SCENE_QUOTE_MAX_LENGTH, SCENE_DESCRIPTION_MAX_LENGTH } from "@/lib/schemas";

type ComposeSceneResult = { quote: string; description: string };

function mockedScene(eyebrow: string, recipientName: string): ComposeSceneResult {
  const topic = eyebrow || "a moment I keep coming back to";
  return {
    quote: `${recipientName}, this is the part I remember most.`.slice(0, SCENE_QUOTE_MAX_LENGTH),
    description: `Thinking about ${topic} still makes me smile.`.slice(0, SCENE_DESCRIPTION_MAX_LENGTH),
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(mockedScene(eyebrow, recipientName));
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            `Write one postcard-style quote (max ${SCENE_QUOTE_MAX_LENGTH} characters, no quotation marks) and one short`,
            `supporting line (max ${SCENE_DESCRIPTION_MAX_LENGTH} characters) for a single scene inside a ${tone} appreciation letter addressed to ${recipientName}.`,
            eyebrow ? `This scene is labeled "${eyebrow}" — write about that specifically.` : `No specific moment was given — keep it warm and general.`,
            context ? `Overall context from the sender about the letter: "${context}".` : ``,
            `Keep both lines short enough to fit on a small card — favor a few punchy words over a full sentence.`,
            `Respond with ONLY raw JSON, no markdown fences, no preamble: {"quote": "...", "description": "..."}`,
          ]
            .filter(Boolean)
            .join(" "),
        },
      ],
    });

    const block = response.content.find((b) => b.type === "text");
    const text = block && "text" in block ? block.text.trim() : "";
    const parsed = JSON.parse(text.replace(/^```(json)?/i, "").replace(/```$/, "").trim());
    if (typeof parsed.quote === "string" && typeof parsed.description === "string") {
      return NextResponse.json({
        quote: parsed.quote.slice(0, SCENE_QUOTE_MAX_LENGTH),
        description: parsed.description.slice(0, SCENE_DESCRIPTION_MAX_LENGTH),
      } satisfies ComposeSceneResult);
    }
  } catch {
    // Fall through to the mocked draft below — a bad AI response shouldn't block the wizard.
  }

  return NextResponse.json(mockedScene(eyebrow, recipientName));
}
