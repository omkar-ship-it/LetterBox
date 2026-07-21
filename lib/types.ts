export type Scene = {
  id: string;
  order: number;
  eyebrow: string;
  quote: string;
  description: string;
  imageUrl: string | null;
  voiceNoteUrl: string | null;
  accentColor: string;
};

export type Card = {
  id: string;
  slug: string;
  editToken: string;
  /** Null for letters sent anonymously or while signed out. */
  userId: string | null;
  senderName: string;
  recipientName: string;
  /** Where the "you've received a letter" email got sent, if anywhere —
   * purely a delivery mechanism, separate from recipientName (what shows on
   * the envelope). Empty means the sender shared the link manually. */
  recipientEmails: string[];
  tone: string;
  title: string;
  message: string;
  envelopeTemplateId: string;
  musicTrackId: string | null;
  /** A sender-uploaded track's URL — takes precedence over musicTrackId when set. */
  musicUrl: string | null;
  /** Original filename of the uploaded track, for display in the wizard/dashboard. Null unless musicUrl is set. */
  musicName: string | null;
  unlockAt: string | null;
  /** Salted scrypt hash ("salt:hash"), or null if the letter has no passcode. Never sent to the client. */
  passcodeHash: string | null;
  viewCount: number;
  createdAt: string;
  /** If true, the letter is destroyed (see `readAt`) once the recipient finishes reading it. */
  selfDestruct: boolean;
  /** Set once the recipient reaches the end of the closing ritual. Null means "not fully read yet". */
  readAt: string | null;
  scenes: Scene[];
};

export type NewSceneInput = Omit<Scene, "id" | "order"> & { id?: string };

export type NewCardInput = {
  userId: string | null;
  senderName: string;
  recipientName: string;
  recipientEmails: string[];
  tone: string;
  title: string;
  message: string;
  envelopeTemplateId: string;
  musicTrackId: string | null;
  musicUrl: string | null;
  musicName: string | null;
  unlockAt: string | null;
  passcodeHash: string | null;
  selfDestruct: boolean;
  scenes: NewSceneInput[];
};

/** What an unauthenticated visitor gets before proving they know the
 * passcode — no scenes, no message, no music, nothing worth protecting. */
export type LockedCardPreview = {
  slug: string;
  recipientName: string;
  senderName: string;
  envelopeTemplateId: string;
  unlockAt: string | null;
};
