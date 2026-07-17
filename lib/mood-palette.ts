/** Deterministic (not random) color pick from scene text, so re-running "AI paint" on the
 *  same words always gives the same answer, and editing the words gives a different one. */
export function moodPalette(text: string, accentColors: string[]): string {
  if (accentColors.length === 0) return "#8a4f96";
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return accentColors[Math.abs(hash) % accentColors.length];
}
