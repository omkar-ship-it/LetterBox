import type { EnvelopeTemplate } from "@/lib/envelope-templates";

const FILIGREE_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M6 6 C 6 34, 24 52, 52 52 C 64 52, 74 62, 74 74' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='74' cy='74' r='3.5' fill='black'/%3E%3Ccircle cx='6' cy='6' r='2.5' fill='black'/%3E%3Cpath d='M20 6 C 20 6, 30 10, 28 20' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")";
const BOTANICAL_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cpath d='M14 84 C 26 60, 20 34, 36 8' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round'/%3E%3Cpath d='M20 62 C 28 57, 34 57, 39 49' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3Cpath d='M18 62 C 12 58, 8 60, 6 54' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3Cpath d='M24 40 C 31 37, 36 38, 41 31' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'/%3E%3Cellipse cx='36' cy='8' rx='6' ry='3.5' fill='black' transform='rotate(-25 36 8)'/%3E%3C/svg%3E\")";

/** A small static echo of the real envelope shape (RevealExperience's
 * .envelope/.envFlap/.envSealWrap) — same paper gradient, same triangular
 * flap via clip-path, same wax-seal dot, and (for templates with a decoration)
 * the same mask-based filigree/botanical/confetti motifs as the real reveal
 * engine — so the landing page's template picker actually looks like the
 * thing you're picking, not just a color swatch. Deliberately skips tape
 * (removed from the real envelope earlier) to stay a fast, simple preview
 * rather than a second reveal-engine implementation. */
export function EnvelopeSwatch({ template }: { template: EnvelopeTemplate }) {
  return (
    <div
      className="relative aspect-[3/2] w-full overflow-hidden rounded-lg shadow-sm"
      style={{
        background: `linear-gradient(155deg, ${template.colors.envPaper} 0%, ${template.colors.envPaper2} 55%, ${template.colors.envPaper3} 100%)`,
      }}
    >
      {(template.decoration === "filigree" || template.decoration === "botanical") && (
        <div
          className="absolute bottom-1 left-1 z-[6] h-6 w-6 opacity-80"
          style={{
            background: template.decorationColor,
            WebkitMaskImage: template.decoration === "filigree" ? FILIGREE_MASK : BOTANICAL_MASK,
            maskImage: template.decoration === "filigree" ? FILIGREE_MASK : BOTANICAL_MASK,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      )}
      {template.decoration === "confetti" && (
        <div
          className="absolute inset-0 z-[6] opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle, ${template.decorationColor} 1.7px, transparent 1.9px), radial-gradient(circle, #ffffff 1.2px, transparent 1.4px), radial-gradient(circle, ${template.decorationColor} 1.1px, transparent 1.3px)`,
            backgroundSize: "18px 18px, 12px 12px, 14px 14px",
            backgroundPosition: "2px 3px, 8px 10px, 13px 2px",
          }}
        />
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
