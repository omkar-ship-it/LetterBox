import { NextResponse } from "next/server";
import { getCardBySlug, updateCardByEditToken } from "@/lib/db/queries";
import { cardInputSchema } from "@/lib/schemas";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const editToken = new URL(req.url).searchParams.get("editToken");

  const card = await getCardBySlug(slug);
  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (editToken !== card.editToken) {
    const { editToken: _drop, ...publicCard } = card;
    void _drop;
    return NextResponse.json({ card: publicCard });
  }
  return NextResponse.json({ card });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.editToken !== "string") {
    return NextResponse.json({ error: "missing editToken" }, { status: 400 });
  }

  const { editToken, ...rest } = body;
  const parsed = cardInputSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const card = await updateCardByEditToken(slug, editToken, parsed.data);
  if (!card) return NextResponse.json({ error: "not found or not yours" }, { status: 404 });
  return NextResponse.json({ card });
}
