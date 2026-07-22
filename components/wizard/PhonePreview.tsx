"use client";

import { RevealExperience } from "@/components/reveal/RevealExperience";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";
import type { Scene, SealType } from "@/lib/types";

export function PhonePreview({
  template,
  senderName,
  recipientName,
  message,
  closingLine,
  scenes,
  sealType,
  sealText,
  sealLogoUrl,
}: {
  template: EnvelopeTemplate;
  senderName: string;
  recipientName: string;
  message: string;
  closingLine: string;
  scenes: Scene[];
  sealType?: SealType | null;
  sealText?: string | null;
  sealLogoUrl?: string | null;
}) {
  return (
    <div className="sticky top-8 hidden lg:block">
      <p className="mb-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-stone-400">Live preview</p>
      <div className="mx-auto w-[300px] rounded-[2.5rem] border-[8px] border-stone-900 bg-stone-900 shadow-2xl">
        <div className="relative h-[600px] w-full overflow-hidden rounded-[2rem] bg-white">
          <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-stone-900" />
          <RevealExperience
            variant="contained"
            template={template}
            senderName={senderName || "a friend"}
            recipientName={recipientName || "You"}
            message={message}
            closingLine={closingLine}
            scenes={scenes}
            sealType={sealType}
            sealText={sealText}
            sealLogoUrl={sealLogoUrl}
          />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-stone-400">
        This is exactly what {recipientName || "they"} will see. Tap the seal to preview the open.
      </p>
    </div>
  );
}
