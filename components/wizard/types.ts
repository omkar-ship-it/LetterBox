export type SceneDraft = {
  id: string;
  eyebrow: string;
  quote: string;
  description: string;
  accentColor: string;
  imageUrl: string | null;
  imageUploading: boolean;
  voiceNoteUrl: string | null;
  voiceUploading: boolean;
};

export const WIZARD_STEPS = ["envelope", "recipient", "scenes", "music", "schedule", "send"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_LABELS: Record<WizardStep, string> = {
  recipient: "Say the thing",
  scenes: "Add scenes",
  envelope: "Choose an envelope",
  music: "Add a soundtrack",
  schedule: "Pick a moment",
  send: "Sign & send",
};
