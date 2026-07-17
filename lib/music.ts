export type MusicTrack = {
  id: string;
  name: string;
  mood: string;
  fileUrl: string;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "warm-embrace", name: "Warm Embrace", mood: "Tender · Piano", fileUrl: "/music/warm-embrace.wav" },
  { id: "sunlit-window", name: "Sunlit Window", mood: "Uplifting · Acoustic", fileUrl: "/music/sunlit-window.wav" },
  { id: "quiet-letter", name: "Quiet Letter", mood: "Cinematic · Strings", fileUrl: "/music/quiet-letter.wav" },
  { id: "golden-hour", name: "Golden Hour", mood: "Warm · Ambient", fileUrl: "/music/golden-hour.wav" },
  { id: "bright-days", name: "Bright Days", mood: "Playful · Nostalgic", fileUrl: "/music/bright-days.wav" },
  { id: "gentle-gratitude", name: "Gentle Gratitude", mood: "Soft · Reflective", fileUrl: "/music/gentle-gratitude.wav" },
];

export function getMusicTrack(id: string | null): MusicTrack | null {
  if (!id) return null;
  return MUSIC_TRACKS.find((t) => t.id === id) ?? null;
}
