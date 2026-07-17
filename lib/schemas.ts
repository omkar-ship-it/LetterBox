import { z } from "zod";

export const sceneInputSchema = z.object({
  id: z.string().optional(),
  eyebrow: z.string().default(""),
  quote: z.string().min(1, "Every scene needs a line, even a short one."),
  description: z.string().default(""),
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
