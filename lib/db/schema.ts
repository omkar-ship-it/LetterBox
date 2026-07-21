import { pgTable, text, timestamp, integer, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One-time email login codes. Hashed at rest (see lib/otp.ts) the same way
// passcodes are — a code is only ever compared, never read back.
export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// The session id itself is the opaque bearer token stored in the browser's
// httpOnly cookie — same "random unguessable string as credential" pattern
// as `cards.editToken` below, not a signed/JWT session.
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  editToken: text("edit_token").notNull(),
  // Null for letters sent anonymously (no account, or not signed in at send
  // time) — set null on account deletion rather than cascading, since the
  // letter itself isn't the account's data to lose.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  senderName: text("sender_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  // Optional — purely a delivery mechanism (who gets emailed the link at
  // send time), separate from recipientName (what's shown on the envelope).
  // Empty means the sender is sharing the link manually, same as before
  // this existed.
  recipientEmails: text("recipient_emails").array().notNull().default([]),
  tone: text("tone").notNull().default("warm"),
  title: text("title").notNull(),
  message: text("message").notNull().default(""),
  envelopeTemplateId: text("envelope_template_id").notNull(),
  musicTrackId: text("music_track_id"),
  // A sender-uploaded track, as an alternative to picking from MUSIC_TRACKS.
  // When set, this wins over musicTrackId (see getCardMusicUrl in lib/music.ts).
  musicUrl: text("music_url"),
  musicName: text("music_name"),
  unlockAt: timestamp("unlock_at", { withTimezone: true }),
  // Salted scrypt hash ("salt:hash"), never the plaintext passcode — see lib/passcode.ts.
  passcodeHash: text("passcode_hash"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Sender's choice at send time — irreversible once readAt is set (see lib/db/queries.ts's markCardRead).
  selfDestruct: boolean("self_destruct").notNull().default(false),
  // Set once the recipient reaches the end of the closing ritual. Null means "not fully read yet".
  readAt: timestamp("read_at", { withTimezone: true }),
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
