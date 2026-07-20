import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Lock } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { getCardsByUserId, getCardsReceivedByEmail } from "@/lib/db/queries";
import { getEnvelopeTemplate } from "@/lib/envelope-templates";
import { EnvelopeSwatch } from "@/components/marketing/EnvelopeSwatch";
import { LogoutButton } from "@/components/LogoutButton";
import type { Card } from "@/lib/types";

function LetterCard({ card, direction }: { card: Omit<Card, "scenes">; direction: "sent" | "received" }) {
  const template = getEnvelopeTemplate(card.envelopeTemplateId);
  const gone = card.selfDestruct && card.readAt;

  return (
    <Link
      href={gone ? "#" : `/c/${card.slug}`}
      aria-disabled={Boolean(gone)}
      className={`rounded-2xl border border-stone-200 bg-white p-4 transition ${
        gone ? "pointer-events-none opacity-60" : "hover:border-[#a8455a]"
      }`}
    >
      <div className="mb-3">
        <EnvelopeSwatch template={template} />
      </div>
      <p className="font-serif text-base text-[#2b2117]">{card.title || `For ${card.recipientName}`}</p>
      <p className="mt-0.5 text-sm text-stone-500">
        {direction === "sent" ? `To ${card.recipientName}` : `From ${card.senderName}`}
      </p>
      <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
        <span>{new Date(card.createdAt).toLocaleDateString()}</span>
        <span>
          {card.viewCount} view{card.viewCount === 1 ? "" : "s"}
        </span>
        {card.passcodeHash && (
          <span className="inline-flex items-center gap-1">
            <Lock size={11} /> locked
          </span>
        )}
        {card.selfDestruct && (
          <span className="inline-flex items-center gap-1">
            <Flame size={11} /> {gone ? "faded away" : "self-destructs"}
          </span>
        )}
      </div>
    </Link>
  );
}

function LetterSection({
  title,
  emptyMessage,
  cards,
  direction,
}: {
  title: string;
  emptyMessage: string;
  cards: Omit<Card, "scenes">[];
  direction: "sent" | "received";
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-serif text-xl text-[#2b2117]">{title}</h2>
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <LetterCard key={card.id} card={card} direction={direction} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function LettersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/letters");

  const [sent, received] = await Promise.all([
    getCardsByUserId(user.id),
    getCardsReceivedByEmail(user.email, user.id),
  ]);

  return (
    <div className="min-h-screen bg-[#fbf6ef]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-serif text-xl text-[#2b2117]">
          Letterbox
        </Link>
        <div className="flex items-center gap-5">
          <span className="text-sm text-stone-500">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl text-[#2b2117]">Your letters</h1>
          <Link
            href="/create"
            className="rounded-full bg-[#a8455a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f3a4c]"
          >
            Create a letter
          </Link>
        </div>

        <LetterSection
          title="Sent"
          emptyMessage="Letters you send while signed in will show up here. Older letters sent without signing in won't automatically appear."
          cards={sent}
          direction="sent"
        />
        <LetterSection
          title="Received"
          emptyMessage="Letters sent to this email address will show up here."
          cards={received}
          direction="received"
        />
      </main>
    </div>
  );
}
