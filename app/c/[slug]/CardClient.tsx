"use client";

import { useState } from "react";
import { RevealExperience } from "@/components/reveal/RevealExperience";
import { LockedCountdown } from "@/components/reveal/LockedCountdown";
import type { Card } from "@/lib/types";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";

export function CardClient({
  card,
  template,
  musicUrl,
}: {
  card: Card;
  template: EnvelopeTemplate;
  musicUrl: string | null;
}) {
  const [locked, setLocked] = useState(
    () => Boolean(card.unlockAt && new Date(card.unlockAt).getTime() > Date.now())
  );

  if (locked && card.unlockAt) {
    return (
      <LockedCountdown
        unlockAt={card.unlockAt}
        template={template}
        recipientName={card.recipientName}
        onUnlocked={() => setLocked(false)}
      />
    );
  }

  return (
    <RevealExperience
      variant="fullscreen"
      template={template}
      senderName={card.senderName}
      recipientName={card.recipientName}
      message={card.message}
      closingLine={card.title}
      scenes={card.scenes}
      musicUrl={musicUrl}
    />
  );
}
