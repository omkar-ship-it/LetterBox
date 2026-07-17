"use client";

import { Check } from "lucide-react";
import { ENVELOPE_TEMPLATES } from "@/lib/envelope-templates";

export function EnvelopeStep({
  envelopeTemplateId,
  setEnvelopeTemplateId,
}: {
  envelopeTemplateId: string;
  setEnvelopeTemplateId: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ENVELOPE_TEMPLATES.map((t) => {
        const selected = t.id === envelopeTemplateId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setEnvelopeTemplateId(t.id)}
            className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
              selected ? "border-[#a8455a]" : "border-stone-200 hover:border-stone-300"
            }`}
            style={{ background: t.colors.desk }}
          >
            {selected && (
              <span className="absolute right-3 top-3 rounded-full bg-[#a8455a] p-1 text-white">
                <Check size={12} />
              </span>
            )}
            <div
              className="mb-3 h-20 w-full rounded-lg"
              style={{
                background: `linear-gradient(155deg, ${t.colors.envPaper}, ${t.colors.envPaper2} 55%, ${t.colors.envPaper3})`,
                boxShadow: `inset 0 0 0 2px ${t.colors.seal}33`,
              }}
            />
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
      })}
    </div>
  );
}
