export type EnvelopeDecoration = "none" | "filigree" | "botanical" | "confetti";

export type EnvelopeTemplate = {
  id: string;
  name: string;
  description: string;
  tier: "free" | "premium";
  decoration: EnvelopeDecoration;
  /** Tints the decoration (mask-based, so any color works regardless of the source SVG). */
  decorationColor: string;
  colors: {
    desk: string;
    ink: string;
    inkSoft: string;
    inkFaint: string;
    envPaper: string;
    envPaper2: string;
    envPaper3: string;
    envShadow: string;
    seal: string;
    sealLight: string;
    sealDark: string;
    gold: string;
    /** Used as a palette-preview swatch in the template picker. */
    tape: string;
  };
  /** Scenes cycle through these accents in order; the last scene (the "peak" card) uses the final color. */
  accentColors: string[];
};

export const ENVELOPE_TEMPLATES: EnvelopeTemplate[] = [
  {
    id: "warm-coral",
    name: "Warm Coral",
    description: "Sun-warmed paper, a green wax seal, a little gold tape. Tender and bright.",
    tier: "free",
    decoration: "none",
    decorationColor: "#d19a35",
    colors: {
      desk: "#fbf1e7",
      ink: "#2b1f1a",
      inkSoft: "#5c473d",
      inkFaint: "#8a7367",
      envPaper: "#ec9066",
      envPaper2: "#de764a",
      envPaper3: "#c4623c",
      envShadow: "#9c4b2c",
      seal: "#1c6b52",
      sealLight: "#2c8a6c",
      sealDark: "#124a39",
      gold: "#d19a35",
      tape: "#eab53f",
    },
    accentColors: ["#d9724a", "#d99a2b", "#2a8f8f", "#d9527a", "#5561a8", "#8a4f96"],
  },
  {
    id: "sunlit-parchment",
    name: "Sunlit Parchment",
    description: "Tan parchment, a deep red seal. Steady, old-friend warmth.",
    tier: "free",
    decoration: "none",
    decorationColor: "#8a6a3c",
    colors: {
      desk: "#f4ede1",
      ink: "#2b1f16",
      inkSoft: "#5c4c3a",
      inkFaint: "#8a7a63",
      envPaper: "#e8c99a",
      envPaper2: "#d9b378",
      envPaper3: "#c29a5c",
      envShadow: "#8a6a3c",
      seal: "#7a1f2b",
      sealLight: "#9c3344",
      sealDark: "#591420",
      gold: "#8a6a3c",
      tape: "#d1a44c",
    },
    accentColors: ["#b5622f", "#8a6a3c", "#5f7a6a", "#a8455a", "#4d6a80", "#6b4f8a"],
  },
  {
    id: "midnight-airmail",
    name: "Midnight Airmail",
    description: "A dark desk, cream paper, red wax, airmail stripes. Quietly dramatic.",
    tier: "free",
    decoration: "none",
    decorationColor: "#c9a05c",
    colors: {
      desk: "#243a5e",
      ink: "#f0e6d8",
      inkSoft: "#cbb89e",
      inkFaint: "#9c8770",
      envPaper: "#e8ddc3",
      envPaper2: "#d4c49f",
      envPaper3: "#b8a578",
      envShadow: "#6b5a3c",
      seal: "#7a1f2b",
      sealLight: "#9c3344",
      sealDark: "#591420",
      gold: "#c9a05c",
      tape: "#c94f4f",
    },
    accentColors: ["#c9a05c", "#9c3344", "#4f6fc9", "#8a6a3c", "#cbb89e", "#7a1f2b"],
  },
  {
    id: "celebration",
    name: "Celebration",
    description: "Marigold paper, a berry-pink seal, teal tape. Confetti in envelope form.",
    tier: "free",
    decoration: "none",
    decorationColor: "#f2933f",
    colors: {
      desk: "#fff2e6",
      ink: "#3a2318",
      inkSoft: "#6b4a34",
      inkFaint: "#a3806a",
      envPaper: "#f7b955",
      envPaper2: "#f2933f",
      envPaper3: "#de6a2c",
      envShadow: "#a8481c",
      seal: "#c23a6b",
      sealLight: "#de5486",
      sealDark: "#8a2249",
      gold: "#f2933f",
      tape: "#6ec6c6",
    },
    accentColors: ["#f2933f", "#c23a6b", "#6ec6c6", "#8a5cc9", "#e0b23a", "#de5486"],
  },
  {
    id: "gratitude",
    name: "Gratitude",
    description: "Sage paper, a terracotta seal, cream tape. Grounded and grateful.",
    tier: "free",
    decoration: "none",
    decorationColor: "#b5622f",
    colors: {
      desk: "#f3f1e6",
      ink: "#2c3326",
      inkSoft: "#565f4a",
      inkFaint: "#8a9179",
      envPaper: "#a8bf94",
      envPaper2: "#8ba578",
      envPaper3: "#6f8a5c",
      envShadow: "#465438",
      seal: "#b5622f",
      sealLight: "#cc7a44",
      sealDark: "#7a3f1c",
      gold: "#b5622f",
      tape: "#e0c46a",
    },
    accentColors: ["#6f8a5c", "#b5622f", "#7a8fa0", "#a8763f", "#8ba578", "#5c7a6a"],
  },
  {
    id: "encouragement",
    name: "Encouragement",
    description: "Sky-blue paper, a coral seal, sunflower tape. Bright and rooting for you.",
    tier: "free",
    decoration: "none",
    decorationColor: "#4f8cae",
    colors: {
      desk: "#eef4f7",
      ink: "#1f2f38",
      inkSoft: "#48606c",
      inkFaint: "#7f97a1",
      envPaper: "#6fa8c9",
      envPaper2: "#4f8cae",
      envPaper3: "#386f8f",
      envShadow: "#244a5c",
      seal: "#e0724a",
      sealLight: "#ec8f6a",
      sealDark: "#a8482a",
      gold: "#4f8cae",
      tape: "#f2c14e",
    },
    accentColors: ["#4f8cae", "#e0724a", "#f2c14e", "#6b8f5c", "#8a6bae", "#3a6b8a"],
  },
  {
    id: "golden-filigree",
    name: "Golden Filigree",
    description: "Ink-black paper, gold foil flourishes, an ornate gold seal. Formal and unforgettable.",
    tier: "premium",
    decoration: "filigree",
    decorationColor: "#d4af5a",
    colors: {
      desk: "#3d2f1a",
      ink: "#f3e6c8",
      inkSoft: "#d4c19a",
      inkFaint: "#a3906a",
      envPaper: "#2b241c",
      envPaper2: "#1c1712",
      envPaper3: "#100d0a",
      envShadow: "#000000",
      seal: "#c9a34a",
      sealLight: "#e6c874",
      sealDark: "#8a6a24",
      gold: "#d4af5a",
      tape: "#d4af5a",
    },
    accentColors: ["#d4af5a", "#8a6a24", "#6b5a3c", "#a3906a", "#c9a34a", "#4a3f2e"],
  },
  {
    id: "blush-botanical",
    name: "Blush Botanical",
    description: "Ivory paper, hand-drawn botanical sprigs, a dusty-rose seal. Soft and romantic.",
    tier: "premium",
    decoration: "botanical",
    decorationColor: "#7a8f6a",
    colors: {
      desk: "#faf3ee",
      ink: "#3a2c2e",
      inkSoft: "#6b4f52",
      inkFaint: "#a3838a",
      envPaper: "#f3e0d9",
      envPaper2: "#e8c9c0",
      envPaper3: "#d9aca3",
      envShadow: "#a3746c",
      seal: "#b5677a",
      sealLight: "#cc8494",
      sealDark: "#7a3f4c",
      gold: "#c9a05c",
      tape: "#d9aca3",
    },
    accentColors: ["#b5677a", "#7a8f6a", "#c9a05c", "#a3746c", "#cc8494", "#5c6b4f"],
  },
  {
    id: "midnight-confetti",
    name: "Midnight Confetti",
    description: "Emerald paper scattered with gold and silver confetti, a bold coral seal. Pure celebration.",
    tier: "premium",
    decoration: "confetti",
    decorationColor: "#e6c874",
    colors: {
      desk: "#1c4d3e",
      ink: "#f3ede0",
      inkSoft: "#c9d9c4",
      inkFaint: "#8fa89c",
      envPaper: "#1c4a3c",
      envPaper2: "#123a2e",
      envPaper3: "#0a2620",
      envShadow: "#051611",
      seal: "#e0724a",
      sealLight: "#ec8f6a",
      sealDark: "#a8482a",
      gold: "#e6c874",
      tape: "#e6c874",
    },
    accentColors: ["#e0724a", "#e6c874", "#c9d9c4", "#4f8cae", "#8a5cc9", "#de5486"],
  },
  {
    id: "ivory-filigree",
    name: "Ivory Filigree",
    description: "Ivory paper, silvered filigree flourishes, a deep plum seal. Elegant and quietly romantic.",
    tier: "premium",
    decoration: "filigree",
    decorationColor: "#b0a48f",
    colors: {
      desk: "#f7f2ea",
      ink: "#3a2f2e",
      inkSoft: "#6b5a56",
      inkFaint: "#a3908a",
      envPaper: "#f3ead9",
      envPaper2: "#e8dcc4",
      envPaper3: "#d9c9a8",
      envShadow: "#a3906a",
      seal: "#6b2f4a",
      sealLight: "#8a4468",
      sealDark: "#4a1f30",
      gold: "#b8a06a",
      tape: "#d9c9a8",
    },
    accentColors: ["#6b2f4a", "#b8a06a", "#5c6b5f", "#a3746c", "#8a4468", "#4a3f2e"],
  },
  {
    id: "sage-botanical",
    name: "Sage Botanical",
    description: "Sage-green paper, hand-drawn botanical sprigs, a terracotta seal. Grounded and warm.",
    tier: "premium",
    decoration: "botanical",
    decorationColor: "#5c6b4f",
    colors: {
      desk: "#eef1e8",
      ink: "#26302a",
      inkSoft: "#4f5c50",
      inkFaint: "#7f8f7a",
      envPaper: "#b9c9a8",
      envPaper2: "#9cb088",
      envPaper3: "#7d9468",
      envShadow: "#4a5c3c",
      seal: "#8a4f3a",
      sealLight: "#a3684a",
      sealDark: "#5c2f1c",
      gold: "#c9a05c",
      tape: "#9cb088",
    },
    accentColors: ["#7d9468", "#8a4f3a", "#c9a05c", "#5f7a8a", "#a3684a", "#4a5c3c"],
  },
  {
    id: "sunset-confetti",
    name: "Sunset Confetti",
    description: "Coral paper scattered with gold confetti, a berry-pink seal. Bright and celebratory.",
    tier: "premium",
    decoration: "confetti",
    decorationColor: "#f2c14e",
    colors: {
      desk: "#fff4e6",
      ink: "#4a2318",
      inkSoft: "#7a4a34",
      inkFaint: "#b08a6a",
      envPaper: "#f9a86a",
      envPaper2: "#f2854a",
      envPaper3: "#de6438",
      envShadow: "#a8481c",
      seal: "#d9436b",
      sealLight: "#ec6a8a",
      sealDark: "#8a2249",
      gold: "#f2c14e",
      tape: "#f2c14e",
    },
    accentColors: ["#f2854a", "#d9436b", "#f2c14e", "#6ec6c6", "#8a5cc9", "#de5486"],
  },
];

export function getEnvelopeTemplate(id: string): EnvelopeTemplate {
  return ENVELOPE_TEMPLATES.find((t) => t.id === id) ?? ENVELOPE_TEMPLATES[0];
}

/** Purchasing isn't wired up yet — enforced server-side too, not just hidden
 * in the wizard UI, so a direct API call can't ship a premium template for
 * free by skipping the client. */
export function isPurchasableTemplateBlocked(id: string): boolean {
  return getEnvelopeTemplate(id).tier === "premium";
}
