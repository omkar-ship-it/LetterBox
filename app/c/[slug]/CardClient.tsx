"use client";

import { useState } from "react";
import { RevealExperience } from "@/components/reveal/RevealExperience";
import { LockedCountdown } from "@/components/reveal/LockedCountdown";
import { getCardMusicUrl } from "@/lib/music";
import type { Card } from "@/lib/types";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";

export function CardClient({
  slug,
  template,
  recipientName,
  senderName,
  unlockAt,
  initialCard,
  selfDestruct,
}: {
  slug: string;
  template: EnvelopeTemplate;
  recipientName: string;
  senderName: string;
  unlockAt: string | null;
  /** Null means the letter is passcode-protected and hasn't been verified
   * yet — scenes/message were never sent to the client in that case. */
  initialCard: Card | null;
  selfDestruct: boolean;
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

  const musicUrl = card ? getCardMusicUrl(card) : null;

  return (
    <RevealExperience
      variant="fullscreen"
      template={template}
      senderName={card?.senderName ?? senderName}
      recipientName={card?.recipientName ?? recipientName}
      message={card?.message}
      closingLine={card?.title}
      scenes={card?.scenes ?? []}
      musicUrl={musicUrl}
      sealType={card?.sealType}
      sealText={card?.sealText}
      sealLogoUrl={card?.sealLogoUrl}
      selfDestruct={selfDestruct}
      onSelfDestruct={() => {
        fetch(`/api/cards/${slug}/mark-read`, { method: "POST" }).catch(() => {});
      }}
      passcodeLocked={!card}
      onVerifyPasscode={
        card
          ? undefined
          : async (guess) => {
              const res = await fetch(`/api/cards/${slug}/verify-passcode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode: guess }),
              });
              const data = await res.json();
              if (!res.ok) return { ok: false, error: data?.error ?? "That's not the right passcode." };
              return { ok: true, card: data.card as Card };
            }
      }
      onUnlocked={(unlockedCard) => setCard(unlockedCard)}
    />
  );
}
