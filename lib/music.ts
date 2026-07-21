export type MusicTrack = {
  id: string;
  name: string;
  mood: string;
  fileUrl: string;
};

// Mood is "Emotion · Occasion" — the emotion word is what a sender actually
// scans for when picking a track, occasion is the tiebreaker.
export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "thank-you", name: "Thank You", mood: "Grateful · Sincere", fileUrl: "/music/lesiakower-thank-you-21604.mp3" },
  { id: "gift-of-giving", name: "The Gift of Giving", mood: "Grateful · Warm", fileUrl: "/music/geoffharvey-the-gift-of-giving-178473.mp3" },
  { id: "kindness-is-magical", name: "Your Kindness Is Magical", mood: "Kind · Magical", fileUrl: "/music/nadiacripps-your-kindness-is-magical-181497.mp3" },
  { id: "culture", name: "Culture", mood: "Reflective · Worldly", fileUrl: "/music/melodigne-culture-313413.mp3" },
  { id: "wedding-waltz", name: "Wedding Waltz", mood: "Romantic · Wedding", fileUrl: "/music/andriig-wedding-wedding-music-568195.mp3" },
  { id: "wedding-day", name: "Wedding Day", mood: "Romantic · Elegant", fileUrl: "/music/paulyudin-wedding-485932.mp3" },
  { id: "wedding-invitation", name: "Wedding Invitation", mood: "Joyful · Wedding", fileUrl: "/music/sahilmadan-wedding-invitation-421393.mp3" },
  { id: "wedding-anniversary", name: "Wedding Anniversary", mood: "Nostalgic · Anniversary", fileUrl: "/music/starostin-wedding-wedding-anniversary-music-263144.mp3" },
  { id: "romantic-love", name: "Romantic Love", mood: "Romantic · Tender", fileUrl: "/music/hitslab-romantic-love-romantics-music-459475.mp3" },
  { id: "gentle-romance", name: "Gentle Romance", mood: "Romantic · Gentle", fileUrl: "/music/paulyudin-romantic-romantic-music-493488.mp3" },
  { id: "valentines-day", name: "Valentine's Day", mood: "Romantic · Sweet", fileUrl: "/music/maksymmalko-romantics-love-valentines-day-481993.mp3" },
  { id: "bright-celebration", name: "Bright Celebration", mood: "Joyful · Festive", fileUrl: "/music/hitslab-celebration-celebration-celebrate-music-374949.mp3" },
  { id: "celebration", name: "Celebration", mood: "Joyful · Uplifting", fileUrl: "/music/nastelbom-celebration-437422.mp3" },
  { id: "party-celebration", name: "Party Celebration", mood: "Festive · Upbeat", fileUrl: "/music/mfcc-event-party-celebration-music-244587.mp3" },
  { id: "birthday", name: "Birthday", mood: "Playful · Birthday", fileUrl: "/music/the_mountain-birthday-490600.mp3" },
  { id: "happy-birthday", name: "Happy Birthday", mood: "Joyful · Birthday", fileUrl: "/music/the_mountain-happy-birthday-513146.mp3" },
];

export function getMusicTrack(id: string | null): MusicTrack | null {
  if (!id) return null;
  return MUSIC_TRACKS.find((t) => t.id === id) ?? null;
}

/** A sender-uploaded track always wins over a preset pick — see the
 * musicUrl column comment in lib/db/schema.ts. */
export function getCardMusicUrl(card: { musicTrackId: string | null; musicUrl: string | null }): string | null {
  return card.musicUrl ?? getMusicTrack(card.musicTrackId)?.fileUrl ?? null;
}
