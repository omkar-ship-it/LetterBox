import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCardBySlug, incrementViewCount } from "@/lib/db/queries";
import { getEnvelopeTemplate } from "@/lib/envelope-templates";
import { getMusicTrack } from "@/lib/music";
import { CardClient } from "./CardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return { title: "Letterbox" };
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

  await incrementViewCount(slug).catch(() => {});

  const template = getEnvelopeTemplate(card.envelopeTemplateId);
  const track = getMusicTrack(card.musicTrackId);

  return <CardClient card={card} template={template} musicUrl={track?.fileUrl ?? null} />;
}
