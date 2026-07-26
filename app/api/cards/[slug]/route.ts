import { NextResponse } from "next/server";
import { getCardBySlug, updateCardByEditToken } from "@/lib/db/queries";
import { cardInputSchema } from "@/lib/schemas";
import { hashPasscode } from "@/lib/passcode";
import type { LockedCardPreview } from "@/lib/types";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const editToken = new URL(req.url).searchParams.get("editToken");

  const card = await getCardBySlug(slug);
  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (editToken === card.editToken) {
    const { passcodeHash: _drop, ...senderCard } = card;
    void _drop;
    return NextResponse.json({ card: senderCard });
  }

  // Not the owner: never leak scenes/message/passcodeHash. If it's
  // passcode-protected, only a locked preview goes out — the actual content
  // only comes from a successful POST to verify-passcode.
  if (card.passcodeHash) {
    const locked: LockedCardPreview = {
      slug: card.slug,
      recipientName: card.recipientName,
      senderName: card.senderName,
      envelopeTemplateId: card.envelopeTemplateId,
      unlockAt: card.unlockAt,
    };
    return NextResponse.json({ locked });
  }

  const { editToken: _drop2, passcodeHash: _drop3, ...publicCard } = card;
  void _drop2;
  void _drop3;
  return NextResponse.json({ card: publicCard });
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

  const { passcode, ...updateRest } = parsed.data;
  const card = await updateCardByEditToken(slug, editToken, {
    ...updateRest,
    passcodeHash: passcode ? hashPasscode(passcode) : null,
  });
  if (!card) return NextResponse.json({ error: "not found or not yours" }, { status: 404 });

  const { passcodeHash: _drop, ...senderCard } = card;
  void _drop;
  return NextResponse.json({ card: senderCard });
}
