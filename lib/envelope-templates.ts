export type EnvelopeTemplate = {
  id: string;
  name: string;
  description: string;
  stampLabel: string;
  tagline: string;
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
    tape: string;
    tape2: string;
  };
  /** Scenes cycle through these accents in order; the last scene (the "peak" card) uses the final color. */
  accentColors: string[];
};

export const ENVELOPE_TEMPLATES: EnvelopeTemplate[] = [
  {
    id: "warm-coral",
    name: "Warm Coral",
    description: "Sun-warmed paper, a green wax seal, a little gold tape. Tender and bright.",
    stampLabel: "WITH LOVE",
    tagline: "a letter, made with care",
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
      tape2: "#f0c869",
    },
    accentColors: ["#d9724a", "#d99a2b", "#2a8f8f", "#d9527a", "#5561a8", "#8a4f96"],
  },
  {
    id: "sunlit-parchment",
    name: "Sunlit Parchment",
    description: "Tan parchment, a deep red seal. Steady, old-friend warmth.",
    stampLabel: "FOR YOU",
    tagline: "in your corner, always",
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
      tape2: "#e0bd6e",
    },
    accentColors: ["#b5622f", "#8a6a3c", "#5f7a6a", "#a8455a", "#4d6a80", "#6b4f8a"],
  },
  {
    id: "midnight-airmail",
    name: "Midnight Airmail",
    description: "A dark desk, cream paper, red wax, airmail stripes. Quietly dramatic.",
    stampLabel: "PAR AVION",
    tagline: "sealed with a promise",
    colors: {
      desk: "#2a2019",
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
      tape2: "#4f6fc9",
    },
    accentColors: ["#c9a05c", "#9c3344", "#4f6fc9", "#8a6a3c", "#cbb89e", "#7a1f2b"],
  },
  {
    id: "celebration",
    name: "Celebration",
    description: "Marigold paper, a berry-pink seal, teal tape. Confetti in envelope form.",
    stampLabel: "CELEBRATE",
    tagline: "a little party, just for you",
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
      tape2: "#8fd9d9",
    },
    accentColors: ["#f2933f", "#c23a6b", "#6ec6c6", "#8a5cc9", "#e0b23a", "#de5486"],
  },
  {
    id: "gratitude",
    name: "Gratitude",
    description: "Sage paper, a terracotta seal, cream tape. Grounded and grateful.",
    stampLabel: "THANK YOU",
    tagline: "gratitude, gathered here",
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
      tape2: "#ecd68f",
    },
    accentColors: ["#6f8a5c", "#b5622f", "#7a8fa0", "#a8763f", "#8ba578", "#5c7a6a"],
  },
  {
    id: "encouragement",
    name: "Encouragement",
    description: "Sky-blue paper, a coral seal, sunflower tape. Bright and rooting for you.",
    stampLabel: "YOU'VE GOT THIS",
    tagline: "in your corner, cheering you on",
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
      tape2: "#f7d47e",
    },
    accentColors: ["#4f8cae", "#e0724a", "#f2c14e", "#6b8f5c", "#8a6bae", "#3a6b8a"],
  },
];

export function getEnvelopeTemplate(id: string): EnvelopeTemplate {
  return ENVELOPE_TEMPLATES.find((t) => t.id === id) ?? ENVELOPE_TEMPLATES[0];
}
