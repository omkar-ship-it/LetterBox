import { Crown } from "lucide-react";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";

/** A small static echo of the real envelope shape (RevealExperience's
 * .envelope/.envFlap/.envSealWrap) — same paper gradient, same triangular
 * flap via clip-path, same wax-seal dot — so the landing page's template
 * picker actually looks like the thing you're picking, not just a color
 * swatch. Deliberately skips tape (removed from the real envelope earlier)
 * and the premium decorations (filigree/botanical/confetti) to stay a fast,
 * simple preview rather than a second reveal-engine implementation. */
export function EnvelopeSwatch({ template }: { template: EnvelopeTemplate }) {
  return (
    <div
      className="relative aspect-[3/2] w-full overflow-hidden rounded-lg shadow-sm"
      style={{
        background: `linear-gradient(155deg, ${template.colors.envPaper} 0%, ${template.colors.envPaper2} 55%, ${template.colors.envPaper3} 100%)`,
      }}
    >
      {template.tier === "premium" && (
        <span
          className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-white"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <Crown size={9} /> Premium
        </span>
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(200deg, ${template.colors.envPaper2} 0%, ${template.colors.envPaper3} 78%, ${template.colors.envShadow} 100%)`,
          clipPath: "polygon(0 0, 100% 0, 50% 60%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[42%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `linear-gradient(160deg, ${template.colors.sealLight}, ${template.colors.seal})`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
}
