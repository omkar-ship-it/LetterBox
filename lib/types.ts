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
  senderName: string;
  recipientName: string;
  tone: string;
  title: string;
  message: string;
  envelopeTemplateId: string;
  musicTrackId: string | null;
  unlockAt: string | null;
  viewCount: number;
  createdAt: string;
  scenes: Scene[];
};

export type NewSceneInput = Omit<Scene, "id" | "order"> & { id?: string };

export type NewCardInput = {
  senderName: string;
  recipientName: string;
  tone: string;
  title: string;
  message: string;
  envelopeTemplateId: string;
  musicTrackId: string | null;
  unlockAt: string | null;
  scenes: NewSceneInput[];
};
