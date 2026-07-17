"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";

export function MusicStep({
  musicTrackId,
  setMusicTrackId,
}: {
  musicTrackId: string | null;
  setMusicTrackId: (id: string | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  function togglePreview(id: string, fileUrl: string) {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewing === id) {
      audio.pause();
      setPreviewing(null);
      return;
    }
    audio.src = fileUrl;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setPreviewing(id);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">Music sets the pace of the reveal. Preview any track before choosing.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MUSIC_TRACKS.map((track) => {
          const selected = track.id === musicTrackId;
          return (
            <div
              key={track.id}
              className={`flex items-center justify-between rounded-xl border-2 p-4 transition ${
                selected ? "border-[#a8455a] bg-[#fdf1ee]" : "border-stone-200 bg-white"
              }`}
            >
              <div>
                <p className="font-serif text-base text-[#2b2117]">{track.name}</p>
                <p className="text-xs uppercase tracking-wide text-stone-400">{track.mood}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePreview(track.id, track.fileUrl)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                  aria-label={previewing === track.id ? "Pause preview" : "Play preview"}
                >
                  {previewing === track.id ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => setMusicTrackId(track.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selected ? "bg-[#a8455a] text-white" : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {selected ? "Selected" : "Pick"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setMusicTrackId(null)}
        className="text-xs font-semibold text-stone-400 underline underline-offset-4 hover:text-stone-600"
      >
        No music, thanks
      </button>
      <audio ref={audioRef} onEnded={() => setPreviewing(null)} />
    </div>
  );
}
