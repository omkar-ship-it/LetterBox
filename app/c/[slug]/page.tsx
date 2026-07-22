import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCardBySlug, incrementViewCount } from "@/lib/db/queries";
import { getEnvelopeTemplate } from "@/lib/envelope-templates";
import { CardClient } from "./CardClient";

function FadedAway() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fbf6ef] px-6 text-center">
      <p className="font-serif text-2xl text-[#2b2117]">This letter has faded away.</p>
      <p className="max-w-xs text-sm text-[#8a7367]">
        It was written to be read once. Whoever it was for has already read it — that&apos;s where it lives now.
      </p>
      <Link href="/" className="mt-4 text-sm font-semibold underline underline-offset-4">
        Back to LetterMail
      </Link>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return { title: "LetterMail" };
  if (card.selfDestruct && card.readAt) {
    return { title: "This letter has faded away — LetterMail" };
  }
  if (card.passcodeHash) {
    return { title: "A private letter — LetterMail", description: "This letter needs a passcode to open." };
  }
  return {
    title: `${card.title || "A letter"} — LetterMail`,
    description: card.message || `${card.senderName} sent ${card.recipientName} a letter.`,
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) notFound();

  // Self-destruct letters are gone for good once read — including for the
  // sender re-visiting their own link. Show why, instead of a generic 404.
  if (card.selfDestruct && card.readAt) {
    return <FadedAway />;
  }

  const template = getEnvelopeTemplate(card.envelopeTemplateId);
  const isPasscodeProtected = Boolean(card.passcodeHash);

  // Passcode-protected cards: scenes/message never reach the client until a
  // correct guess hits /verify-passcode — view count moves there too, so a
  // page load alone (without ever entering the code) doesn't count as a view.
  if (!isPasscodeProtected) {
    await incrementViewCount(slug).catch(() => {});
  }

  return (
    <CardClient
      slug={slug}
      template={template}
      recipientName={card.recipientName}
      senderName={card.senderName}
      unlockAt={card.unlockAt}
      initialCard={isPasscodeProtected ? null : card}
      selfDestruct={card.selfDestruct}
    />
  );
}
