import { eq, asc } from "drizzle-orm";
import { db, hasDb } from "./index";
import { cards, scenes } from "./schema";
import type { Card, NewCardInput } from "@/lib/types";
import { generateSlug, generateEditToken } from "@/lib/slug";
import * as mem from "./memory-store";

type CardRow = typeof cards.$inferSelect;
type SceneRow = typeof scenes.$inferSelect;

function rowsToCard(cardRow: CardRow, sceneRows: SceneRow[]): Card {
  return {
    id: cardRow.id,
    slug: cardRow.slug,
    editToken: cardRow.editToken,
    senderName: cardRow.senderName,
    recipientName: cardRow.recipientName,
    tone: cardRow.tone,
    title: cardRow.title,
    message: cardRow.message,
    envelopeTemplateId: cardRow.envelopeTemplateId,
    musicTrackId: cardRow.musicTrackId,
    unlockAt: cardRow.unlockAt ? cardRow.unlockAt.toISOString() : null,
    viewCount: cardRow.viewCount,
    createdAt: cardRow.createdAt.toISOString(),
    scenes: sceneRows
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        order: s.order,
        eyebrow: s.eyebrow,
        quote: s.quote,
        description: s.description,
        imageUrl: s.imageUrl,
        voiceNoteUrl: s.voiceNoteUrl,
        accentColor: s.accentColor,
      })),
  };
}

function sceneValues(cardId: string, input: NewCardInput["scenes"]) {
  return input.map((s, i) => ({
    cardId,
    order: i,
    eyebrow: s.eyebrow,
    quote: s.quote,
    description: s.description,
    imageUrl: s.imageUrl,
    voiceNoteUrl: s.voiceNoteUrl,
    accentColor: s.accentColor,
  }));
}

export async function createCard(input: NewCardInput): Promise<Card> {
  if (!hasDb || !db) return mem.memCreateCard(input);

  let slug = generateSlug();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.select({ id: cards.id }).from(cards).where(eq(cards.slug, slug)).limit(1);
    if (existing.length === 0) break;
    slug = generateSlug();
  }

  const [cardRow] = await db
    .insert(cards)
    .values({
      slug,
      editToken: generateEditToken(),
      senderName: input.senderName,
      recipientName: input.recipientName,
      tone: input.tone,
      title: input.title,
      message: input.message,
      envelopeTemplateId: input.envelopeTemplateId,
      musicTrackId: input.musicTrackId,
      unlockAt: input.unlockAt ? new Date(input.unlockAt) : null,
    })
    .returning();

  const sceneRows = input.scenes.length
    ? await db.insert(scenes).values(sceneValues(cardRow.id, input.scenes)).returning()
    : [];

  return rowsToCard(cardRow, sceneRows);
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  if (!hasDb || !db) return mem.memGetCardBySlug(slug);

  const [cardRow] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!cardRow) return null;
  const sceneRows = await db.select().from(scenes).where(eq(scenes.cardId, cardRow.id)).orderBy(asc(scenes.order));
  return rowsToCard(cardRow, sceneRows);
}

export async function updateCardByEditToken(
  slug: string,
  editToken: string,
  input: NewCardInput
): Promise<Card | null> {
  if (!hasDb || !db) return mem.memUpdateCardByEditToken(slug, editToken, input);

  const [cardRow] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!cardRow || cardRow.editToken !== editToken) return null;

  const [updatedRow] = await db
    .update(cards)
    .set({
      senderName: input.senderName,
      recipientName: input.recipientName,
      tone: input.tone,
      title: input.title,
      message: input.message,
      envelopeTemplateId: input.envelopeTemplateId,
      musicTrackId: input.musicTrackId,
      unlockAt: input.unlockAt ? new Date(input.unlockAt) : null,
    })
    .where(eq(cards.id, cardRow.id))
    .returning();

  await db.delete(scenes).where(eq(scenes.cardId, cardRow.id));
  const sceneRows = input.scenes.length
    ? await db.insert(scenes).values(sceneValues(cardRow.id, input.scenes)).returning()
    : [];

  return rowsToCard(updatedRow, sceneRows);
}

export async function incrementViewCount(slug: string): Promise<void> {
  if (!hasDb || !db) return mem.memIncrementViewCount(slug);

  const [cardRow] = await db.select({ id: cards.id, viewCount: cards.viewCount }).from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!cardRow) return;
  await db.update(cards).set({ viewCount: cardRow.viewCount + 1 }).where(eq(cards.id, cardRow.id));
}
