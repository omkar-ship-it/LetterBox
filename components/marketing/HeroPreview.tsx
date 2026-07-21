"use client";

import { RevealExperience } from "@/components/reveal/RevealExperience";
import { SAMPLE_SCENES, SAMPLE_TEMPLATE } from "@/lib/sample-card";

export function HeroPreview() {
  return (
    <div className="mx-auto w-[280px] rounded-[2.5rem] border-[8px] border-stone-900 bg-stone-900 shadow-2xl sm:w-[300px]">
      <div className="relative h-[560px] w-full overflow-hidden rounded-[2rem] bg-white sm:h-[600px]">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-stone-900" />
        <RevealExperience
          variant="contained"
          template={SAMPLE_TEMPLATE}
          senderName="Maya"
          recipientName="You"
          showAddress={false}
          gateSubcaption="a little something, just because"
          closingLine="Thank you — for exactly who you are."
          scenes={SAMPLE_SCENES}
        />
      </div>
    </div>
  );
}
