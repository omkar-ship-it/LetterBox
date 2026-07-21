import { z } from "zod";

// A postcard only reads as a postcard if it stays a fixed, predictable
// shape — these caps are what let the reveal engine skip adaptive sizing
// entirely (confirmed on a real device: dynamic font-shrinking and
// card-growth both stopped looking like a postcard past a certain length).
// Enforced here (server) and mirrored as `maxLength` in the wizard's
// textareas (client) — both matter, not just the UI hint.
// Raised from 40/70/160: the postcard layout (RevealExperience.module.css —
// pcContent flex share, line-clamp counts, contentScale tiers) was widened
// and retuned to match, verified against real max-length content at mobile
// width before landing on these numbers, not just bumped blindly.
export const SCENE_EYEBROW_MAX_LENGTH = 48;
// The wizard dropped its separate "a little more detail" box (one field per
// scene now, not two) — raised from 130 so a single quote can carry what
// used to be split across quote+description. contentScale() in
// RevealExperience.tsx already shrinks the postcard font as combined length
// grows, so this doesn't need new CSS, just a real-content check that it
// still reads cleanly at the top of that range.
export const SCENE_QUOTE_MAX_LENGTH = 260;
export const SCENE_DESCRIPTION_MAX_LENGTH = 280;

export const sceneInputSchema = z.object({
  id: z.string().optional(),
  eyebrow: z.string().max(SCENE_EYEBROW_MAX_LENGTH, `Keep it postcard-short — ${SCENE_EYEBROW_MAX_LENGTH} characters max.`).default(""),
  quote: z
    .string()
    .min(1, "Every scene needs a line, even a short one.")
    .max(SCENE_QUOTE_MAX_LENGTH, `Keep it postcard-short — ${SCENE_QUOTE_MAX_LENGTH} characters max.`),
  description: z.string().max(SCENE_DESCRIPTION_MAX_LENGTH, `Keep it postcard-short — ${SCENE_DESCRIPTION_MAX_LENGTH} characters max.`).default(""),
  imageUrl: z.string().nullable(),
  voiceNoteUrl: z.string().nullable(),
  accentColor: z.string(),
});

export const PASSCODE_MIN_LENGTH = 4;
export const PASSCODE_MAX_LENGTH = 30;

// The opening message is the only place it's shown to the recipient — the
// envelope's address block, a small fixed-position corner of a fixed-size
// graphic (see .envAddress in RevealExperience.module.css). An unbounded
// field there isn't a "generous" choice, it's just a guaranteed illegible
// or overflowing box once someone writes a real paragraph. Capped for the
// same reason the scene fields are.
export const MESSAGE_MAX_LENGTH = 240;

export const RECIPIENT_EMAILS_MAX = 5;

// Short on purpose — this sits inside a 66px wax seal (see .envSealText in
// RevealExperience.module.css), not a text field. 3 characters is enough
// for initials like "A&J" without the font shrinking past legible.
export const SEAL_TEXT_MAX_LENGTH = 3;

export const cardInputSchema = z.object({
  senderName: z.string().min(1, "Your name is required."),
  recipientName: z.string().min(1, "Who is this for?"),
  // Optional — a delivery mechanism, not identity. Duplicates are silently
  // deduped (someone pasting the same address twice shouldn't get emailed
  // twice) rather than rejected, since that's clearly not deliberate.
  recipientEmails: z
    .array(z.string().email("That doesn't look like a valid email."))
    .max(RECIPIENT_EMAILS_MAX, `Up to ${RECIPIENT_EMAILS_MAX} email addresses.`)
    .default([])
    .transform((emails) => Array.from(new Set(emails.map((e) => e.trim().toLowerCase())))),
  tone: z.string().default("warm"),
  title: z.string().default(""),
  message: z.string().max(MESSAGE_MAX_LENGTH, `Keep it envelope-short — ${MESSAGE_MAX_LENGTH} characters max.`).default(""),
  envelopeTemplateId: z.string().min(1),
  musicTrackId: z.string().nullable(),
  // A sender-uploaded track (from /api/upload), as an alternative to musicTrackId.
  musicUrl: z.string().nullable(),
  musicName: z.string().nullable(),
  // Personalizes the wax seal — "letters" needs sealText, "logo" needs
  // sealLogoUrl (from /api/upload). Not cross-validated against each other
  // here since a sender switching between them client-side may transiently
  // have both/neither set; the wizard only ever submits one meaningfully.
  sealType: z.enum(["letters", "logo"]).nullable(),
  sealText: z.string().max(SEAL_TEXT_MAX_LENGTH, `Keep it seal-short — ${SEAL_TEXT_MAX_LENGTH} characters max.`).nullable(),
  sealLogoUrl: z.string().nullable(),
  unlockAt: z.string().nullable(),
  // Plaintext, submitted once at create/update time only — the API route
  // hashes it before it ever reaches the database (see lib/passcode.ts).
  passcode: z
    .string()
    .min(PASSCODE_MIN_LENGTH, `A passcode needs at least ${PASSCODE_MIN_LENGTH} characters.`)
    .max(PASSCODE_MAX_LENGTH, `Keep the passcode under ${PASSCODE_MAX_LENGTH} characters.`)
    .nullable(),
  selfDestruct: z.boolean().default(false),
  scenes: z.array(sceneInputSchema).min(1, "Add at least one scene."),
});
