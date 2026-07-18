import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCardBySlug, incrementViewCount } from "@/lib/db/queries";
import { getEnvelopeTemplate } from "@/lib/envelope-templates";
import { CardClient } from "./CardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return { title: "Letterbox" };
  if (card.passcodeHash) {
    return { title: "A private letter — Letterbox", description: "This letter needs a passcode to open." };
  }
  return {
    title: `${card.title || "A letter"} — Letterbox`,
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
    />
  );
}
