"use client";

import { Check } from "lucide-react";
import { ENVELOPE_TEMPLATES, type EnvelopeTemplate } from "@/lib/envelope-templates";
import { EnvelopeSwatch } from "@/components/marketing/EnvelopeSwatch";

function TemplateCard({
  t,
  selected,
  onSelect,
}: {
  t: EnvelopeTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
        selected ? "border-[#a8455a]" : "border-stone-200 hover:border-stone-300"
      }`}
      style={{ background: t.colors.desk }}
    >
      {selected && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#a8455a] p-1 text-white">
          <Check size={12} />
        </span>
      )}
      <div className="mb-3">
        <EnvelopeSwatch template={t} />
      </div>
      <p className="font-serif text-lg" style={{ color: t.colors.ink }}>
        {t.name}
      </p>
      <p className="mt-1 text-xs" style={{ color: t.colors.inkSoft }}>
        {t.description}
      </p>
      <div className="mt-3 flex gap-1.5">
        {[t.colors.envPaper, t.colors.seal, t.colors.tape, t.colors.gold].map((c, i) => (
          <span key={i} className="h-3 w-3 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </button>
  );
}

export function EnvelopeStep({
  envelopeTemplateId,
  setEnvelopeTemplateId,
}: {
  envelopeTemplateId: string;
  setEnvelopeTemplateId: (id: string) => void;
}) {
  const free = ENVELOPE_TEMPLATES.filter((t) => t.tier === "free");
  const premium = ENVELOPE_TEMPLATES.filter((t) => t.tier === "premium");

  return (
    <div className="space-y-8">
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {free.map((t) => (
            <TemplateCard key={t.id} t={t} selected={t.id === envelopeTemplateId} onSelect={() => setEnvelopeTemplateId(t.id)} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Premium</p>
        <p className="mb-4 text-xs text-stone-400">
          Richer templates with hand-drawn detail. Preview them here — purchasing is coming soon, so letters can&apos;t be sent
          with one selected just yet.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {premium.map((t) => (
            <TemplateCard key={t.id} t={t} selected={t.id === envelopeTemplateId} onSelect={() => setEnvelopeTemplateId(t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
