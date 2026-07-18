import { NextResponse } from "next/server";
import { verifyCardPasscode, incrementViewCount } from "@/lib/db/queries";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const guess = typeof body?.passcode === "string" ? body.passcode : "";
  if (!guess) return NextResponse.json({ error: "Enter the passcode." }, { status: 400 });

  const card = await verifyCardPasscode(slug, guess);
  if (!card) return NextResponse.json({ error: "That's not the right passcode." }, { status: 401 });

  await incrementViewCount(slug).catch(() => {});

  const { editToken: _drop, passcodeHash: _drop2, ...publicCard } = card;
  void _drop;
  void _drop2;
  return NextResponse.json({ card: publicCard });
}
