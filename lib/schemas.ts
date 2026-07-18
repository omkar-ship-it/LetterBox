import { z } from "zod";

// A postcard only reads as a postcard if it stays a fixed, predictable
// shape — these caps are what let the reveal engine skip adaptive sizing
// entirely (confirmed on a real device: dynamic font-shrinking and
// card-growth both stopped looking like a postcard past a certain length).
// Enforced here (server) and mirrored as `maxLength` in the wizard's
// textareas (client) — both matter, not just the UI hint.
export const SCENE_QUOTE_MAX_LENGTH = 70;
export const SCENE_DESCRIPTION_MAX_LENGTH = 160;

export const sceneInputSchema = z.object({
  id: z.string().optional(),
  eyebrow: z.string().default(""),
  quote: z
    .string()
    .min(1, "Every scene needs a line, even a short one.")
    .max(SCENE_QUOTE_MAX_LENGTH, `Keep it postcard-short — ${SCENE_QUOTE_MAX_LENGTH} characters max.`),
  description: z.string().max(SCENE_DESCRIPTION_MAX_LENGTH, `Keep it postcard-short — ${SCENE_DESCRIPTION_MAX_LENGTH} characters max.`).default(""),
  imageUrl: z.string().nullable(),
  voiceNoteUrl: z.string().nullable(),
  accentColor: z.string(),
});

export const cardInputSchema = z.object({
  senderName: z.string().min(1, "Your name is required."),
  recipientName: z.string().min(1, "Who is this for?"),
  tone: z.string().default("warm"),
  title: z.string().default(""),
  message: z.string().default(""),
  envelopeTemplateId: z.string().min(1),
  musicTrackId: z.string().nullable(),
  unlockAt: z.string().nullable(),
  scenes: z.array(sceneInputSchema).min(1, "Add at least one scene."),
});
