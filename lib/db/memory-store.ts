import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Card, NewCardInput } from "@/lib/types";
import { generateReadableSlug, generateEditToken } from "@/lib/slug";

// Local-dev fallback used whenever POSTGRES_URL isn't set, so the full
// create -> share -> view flow is testable before real credentials exist.
//
// Persisted to a JSON file rather than a module-level Map: Next.js evaluates
// this module separately per bundling layer (route handlers vs. server
// components each get their own instance), so an in-memory Map created by
// the POST /api/cards handler isn't visible to the GET in /c/[slug]'s page
// module even within the same `next dev` process — confirmed by a real 404
// during end-to-end testing. The file is the one thing both layers share.
const DATA_FILE = path.join(process.cwd(), ".data", "dev-cards.json");

async function readAll(): Promise<Record<string, Card>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, Card>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, Card>): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function toScenes(input: NewCardInput["scenes"]) {
  return input.map((s, i) => ({
    id: s.id ?? randomUUID(),
    order: i,
    eyebrow: s.eyebrow,
    quote: s.quote,
    description: s.description,
    imageUrl: s.imageUrl,
    voiceNoteUrl: s.voiceNoteUrl,
    accentColor: s.accentColor,
  }));
}

export async function memCreateCard(input: NewCardInput): Promise<Card> {
  const all = await readAll();
  let slug = generateReadableSlug(input.senderName, input.recipientName, input.tone);
  while (all[slug]) slug = generateReadableSlug(input.senderName, input.recipientName, input.tone);

  const card: Card = {
    id: randomUUID(),
    slug,
    editToken: generateEditToken(),
    userId: input.userId,
    senderName: input.senderName,
    recipientName: input.recipientName,
    recipientEmails: input.recipientEmails,
    tone: input.tone,
    title: input.title,
    message: input.message,
    envelopeTemplateId: input.envelopeTemplateId,
    musicTrackId: input.musicTrackId,
    musicUrl: input.musicUrl,
    musicName: input.musicName,
    sealType: input.sealType,
    sealText: input.sealText,
    sealLogoUrl: input.sealLogoUrl,
    unlockAt: input.unlockAt,
    passcodeHash: input.passcodeHash,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    selfDestruct: input.selfDestruct,
    readAt: null,
    scenes: toScenes(input.scenes),
  };

  all[slug] = card;
  await writeAll(all);
  return card;
}

export async function memGetCardBySlug(slug: string): Promise<Card | null> {
  const all = await readAll();
  return all[slug] ?? null;
}

export async function memUpdateCardByEditToken(
  slug: string,
  editToken: string,
  input: Omit<NewCardInput, "userId">
): Promise<Card | null> {
  const all = await readAll();
  const existing = all[slug];
  if (!existing || existing.editToken !== editToken) return null;

  const updated: Card = {
    ...existing,
    senderName: input.senderName,
    recipientName: input.recipientName,
    recipientEmails: input.recipientEmails,
    tone: input.tone,
    title: input.title,
    message: input.message,
    envelopeTemplateId: input.envelopeTemplateId,
    musicTrackId: input.musicTrackId,
    musicUrl: input.musicUrl,
    musicName: input.musicName,
    sealType: input.sealType,
    sealText: input.sealText,
    sealLogoUrl: input.sealLogoUrl,
    unlockAt: input.unlockAt,
    passcodeHash: input.passcodeHash,
    selfDestruct: input.selfDestruct,
    scenes: toScenes(input.scenes),
  };

  all[slug] = updated;
  await writeAll(all);
  return updated;
}

export async function memIncrementViewCount(slug: string): Promise<void> {
  const all = await readAll();
  const card = all[slug];
  if (!card) return;
  card.viewCount += 1;
  await writeAll(all);
}

export async function memMarkCardRead(slug: string): Promise<void> {
  const all = await readAll();
  const card = all[slug];
  if (!card || card.readAt) return;
  card.readAt = new Date().toISOString();
  await writeAll(all);
}
