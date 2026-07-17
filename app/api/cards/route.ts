import { NextResponse } from "next/server";
import { createCard } from "@/lib/db/queries";
import { cardInputSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid JSON" }, { status: 400 });

  const parsed = cardInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const card = await createCard(parsed.data);
  return NextResponse.json({ card });
}
