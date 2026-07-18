"use client";

import { useState } from "react";
import { RevealExperience } from "@/components/reveal/RevealExperience";
import { LockedCountdown } from "@/components/reveal/LockedCountdown";
import { PasscodeGate } from "@/components/reveal/PasscodeGate";
import { getMusicTrack } from "@/lib/music";
import type { Card } from "@/lib/types";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";

export function CardClient({
  slug,
  template,
  recipientName,
  senderName,
  unlockAt,
  initialCard,
}: {
  slug: string;
  template: EnvelopeTemplate;
  recipientName: string;
  senderName: string;
  unlockAt: string | null;
  /** Null means the letter is passcode-protected and hasn't been verified
   * yet — scenes/message were never sent to the client in that case. */
  initialCard: Card | null;
}) {
  const [card, setCard] = useState(initialCard);
  const [timeLocked, setTimeLocked] = useState(
    () => Boolean(unlockAt && new Date(unlockAt).getTime() > Date.now())
  );

  if (timeLocked && unlockAt) {
    return (
      <LockedCountdown
        unlockAt={unlockAt}
        template={template}
        recipientName={recipientName}
        onUnlocked={() => setTimeLocked(false)}
      />
    );
  }

  if (!card) {
    return (
      <PasscodeGate
        slug={slug}
        template={template}
        recipientName={recipientName}
        senderName={senderName}
        onUnlocked={(unlockedCard) => setCard(unlockedCard)}
      />
    );
  }

  const track = getMusicTrack(card.musicTrackId);

  return (
    <RevealExperience
      variant="fullscreen"
      template={template}
      senderName={card.senderName}
      recipientName={card.recipientName}
      message={card.message}
      closingLine={card.title}
      scenes={card.scenes}
      musicUrl={track?.fileUrl ?? null}
    />
  );
}
