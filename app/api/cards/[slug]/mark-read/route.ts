import { NextResponse } from "next/server";
import { markCardRead } from "@/lib/db/queries";

/** Fired by the reveal engine once a self-destruct letter's closing ritual
 * finishes — the recipient has reached the end. Idempotent (see
 * lib/db/queries.ts's markCardRead), so no ok/already-gone distinction is
 * needed in the response. */
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await markCardRead(slug).catch(() => {});
  return NextResponse.json({ ok: true });
}
