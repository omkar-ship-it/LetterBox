import type { Scene } from "./types";
import { ENVELOPE_TEMPLATES } from "./envelope-templates";

const template = ENVELOPE_TEMPLATES[0];

export const SAMPLE_SCENES: Scene[] = [
  {
    id: "sample-1",
    order: 0,
    eyebrow: "Noticed",
    quote: "You make hard days feel survivable.",
    description: "You show up, every single day, and call it nothing.",
    imageUrl: null,
    voiceNoteUrl: null,
    accentColor: template.accentColors[0],
  },
  {
    id: "sample-2",
    order: 1,
    eyebrow: "Remembered",
    quote: "It's the small things, not the big days.",
    description: "The little check-ins. I notice everything.",
    imageUrl: null,
    voiceNoteUrl: null,
    accentColor: template.accentColors[1],
  },
  {
    id: "sample-3",
    order: 2,
    eyebrow: "",
    quote: "Thank you — for exactly who you are.",
    description: "",
    imageUrl: null,
    voiceNoteUrl: null,
    accentColor: template.accentColors[5],
  },
];

export const SAMPLE_TEMPLATE = template;
