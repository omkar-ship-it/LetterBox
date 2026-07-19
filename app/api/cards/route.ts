import { NextResponse } from "next/server";
import { createCard } from "@/lib/db/queries";
import { cardInputSchema } from "@/lib/schemas";
import { isPurchasableTemplateBlocked } from "@/lib/envelope-templates";
import { hashPasscode } from "@/lib/passcode";
import { getSessionUser } from "@/lib/session";
import { sendLetterNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  // The wizard UI is gated behind sign-in (app/create/page.tsx), but that's
  // just a redirect — this is the actual boundary, since the endpoint is
  // reachable directly regardless of what the UI shows.
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in to create a letter." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid JSON" }, { status: 400 });

  const parsed = cardInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (isPurchasableTemplateBlocked(parsed.data.envelopeTemplateId)) {
    return NextResponse.json({ error: "This envelope template requires a purchase, which isn't available yet." }, { status: 402 });
  }

  const { passcode, ...rest } = parsed.data;
  const card = await createCard({
    ...rest,
    passcodeHash: passcode ? hashPasscode(passcode) : null,
    userId: sessionUser.id,
  });

  // Best-effort — a failed notification email shouldn't fail card creation,
  // the link still works and the sender can always copy/share it manually.
  // Only fires on the initial send, not on later edits.
  if (card.recipientEmails.length > 0) {
    const letterUrl = `${new URL(req.url).origin}/c/${card.slug}`;
    await Promise.allSettled(
      card.recipientEmails.map((to) =>
        sendLetterNotificationEmail(to, { senderName: card.senderName, recipientName: card.recipientName, letterUrl })
      )
    );
  }

  // The sender gets editToken back (needed to edit later) but never the hash.
  const { passcodeHash: _drop, ...senderCard } = card;
  void _drop;
  return NextResponse.json({ card: senderCard });
}
