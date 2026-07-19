export type MusicTrack = {
  id: string;
  name: string;
  mood: string;
  fileUrl: string;
};

// Mood is "Emotion · Texture" — the emotion word is what a sender actually
// scans for when picking a track, texture is the tiebreaker. Kept to a
// fixed emotion vocabulary on purpose so it reads as a deliberate set, not
// a grab-bag of adjectives.
export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "first-light", name: "First Light", mood: "Warm · Piano", fileUrl: "/music/first-light.wav" },
  { id: "paper-airplanes", name: "Paper Airplanes", mood: "Playful · Pizzicato", fileUrl: "/music/paper-airplanes.wav" },
  { id: "thank-you-truly", name: "Thank You, Truly", mood: "Gratitude · Strings", fileUrl: "/music/thank-you-truly.wav" },
  { id: "confetti-sky", name: "Confetti Sky", mood: "Enthusiastic · Marimba", fileUrl: "/music/confetti-sky.wav" },
  { id: "held-close", name: "Held Close", mood: "Tender · Piano", fileUrl: "/music/held-close.wav" },
  { id: "morning-windows", name: "Morning Windows", mood: "Uplifting · Acoustic", fileUrl: "/music/morning-windows.wav" },
  { id: "quiet-company", name: "Quiet Company", mood: "Reflective · Ambient", fileUrl: "/music/quiet-company.wav" },
  { id: "homecoming", name: "Homecoming", mood: "Nostalgic · Warm Pad", fileUrl: "/music/homecoming.wav" },
  { id: "open-road", name: "Open Road", mood: "Joyful · Guitar", fileUrl: "/music/open-road.wav" },
  { id: "still-water", name: "Still Water", mood: "Serene · Ambient", fileUrl: "/music/still-water.wav" },
  { id: "new-chapter", name: "New Chapter", mood: "Hopeful · Piano", fileUrl: "/music/new-chapter.wav" },
  { id: "well-earned", name: "Well Earned", mood: "Triumphant · Bright", fileUrl: "/music/well-earned.wav" },
  { id: "fireside", name: "Fireside", mood: "Cozy · Warm Pad", fileUrl: "/music/fireside.wav" },
  { id: "one-more-chapter", name: "One More Chapter", mood: "Wistful · Strings", fileUrl: "/music/one-more-chapter.wav" },
];

export function getMusicTrack(id: string | null): MusicTrack | null {
  if (!id) return null;
  return MUSIC_TRACKS.find((t) => t.id === id) ?? null;
}
