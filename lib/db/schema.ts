import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  editToken: text("edit_token").notNull(),
  senderName: text("sender_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  tone: text("tone").notNull().default("warm"),
  title: text("title").notNull(),
  message: text("message").notNull().default(""),
  envelopeTemplateId: text("envelope_template_id").notNull(),
  musicTrackId: text("music_track_id"),
  unlockAt: timestamp("unlock_at", { withTimezone: true }),
  // Salted scrypt hash ("salt:hash"), never the plaintext passcode — see lib/passcode.ts.
  passcodeHash: text("passcode_hash"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  eyebrow: text("eyebrow").notNull().default(""),
  quote: text("quote").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  voiceNoteUrl: text("voice_note_url"),
  accentColor: text("accent_color").notNull(),
});
