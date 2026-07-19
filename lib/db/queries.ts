import { eq, asc, and, isNull, desc } from "drizzle-orm";
import { db, hasDb } from "./index";
import { cards, scenes } from "./schema";
import type { Card, NewCardInput } from "@/lib/types";
import { generateSlug, generateEditToken } from "@/lib/slug";
import { verifyPasscode } from "@/lib/passcode";
import * as mem from "./memory-store";

type CardRow = typeof cards.$inferSelect;
type SceneRow = typeof scenes.$inferSelect;

function rowsToCard(cardRow: CardRow, sceneRows: SceneRow[]): Card {
  return {
    id: cardRow.id,
    slug: cardRow.slug,
    editToken: cardRow.editToken,
    userId: cardRow.userId,
    senderName: cardRow.senderName,
    recipientName: cardRow.recipientName,
    tone: cardRow.tone,
    title: cardRow.title,
    message: cardRow.message,
    envelopeTemplateId: cardRow.envelopeTemplateId,
    musicTrackId: cardRow.musicTrackId,
    unlockAt: cardRow.unlockAt ? cardRow.unlockAt.toISOString() : null,
    passcodeHash: cardRow.passcodeHash,
    viewCount: cardRow.viewCount,
    createdAt: cardRow.createdAt.toISOString(),
    selfDestruct: cardRow.selfDestruct,
    readAt: cardRow.readAt ? cardRow.readAt.toISOString() : null,
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
      userId: input.userId,
      senderName: input.senderName,
      recipientName: input.recipientName,
      tone: input.tone,
      title: input.title,
      message: input.message,
      envelopeTemplateId: input.envelopeTemplateId,
      musicTrackId: input.musicTrackId,
      unlockAt: input.unlockAt ? new Date(input.unlockAt) : null,
      passcodeHash: input.passcodeHash,
      selfDestruct: input.selfDestruct,
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
  input: Omit<NewCardInput, "userId">
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
      passcodeHash: input.passcodeHash,
      selfDestruct: input.selfDestruct,
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

/** Returns the full card (scenes included) only if the guess matches the
 * stored hash — this is the one place a correct passcode actually unlocks
 * content, so the API route has nothing to leak before calling this. */
export async function verifyCardPasscode(slug: string, guess: string): Promise<Card | null> {
  const card = await getCardBySlug(slug);
  if (!card || !card.passcodeHash) return null;
  return verifyPasscode(guess, card.passcodeHash) ? card : null;
}

/** All letters attached to an account, newest first — cards created
 * anonymously (or while signed out) never have a userId, so they can't show
 * up here regardless of who's logged in. Scenes aren't needed for a list
 * view, so this skips the per-card scenes join `getCardBySlug` does. */
export async function getCardsByUserId(userId: string): Promise<Omit<Card, "scenes">[]> {
  if (!hasDb || !db) return [];

  const rows = await db.select().from(cards).where(eq(cards.userId, userId)).orderBy(desc(cards.createdAt));
  return rows.map((cardRow) => {
    const { scenes: _scenes, ...rest } = rowsToCard(cardRow, []);
    void _scenes;
    return rest;
  });
}

/** Marks a self-destruct letter as fully read. Idempotent (only the first
 * call sets `readAt`) so a retry or a duplicate client call can't matter —
 * the "gone" state is triggered by `readAt` being non-null, not by how many
 * times this ran. */
export async function markCardRead(slug: string): Promise<void> {
  if (!hasDb || !db) return mem.memMarkCardRead(slug);

  const [cardRow] = await db.select({ id: cards.id }).from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!cardRow) return;
  await db
    .update(cards)
    .set({ readAt: new Date() })
    .where(and(eq(cards.id, cardRow.id), isNull(cards.readAt)));
}
