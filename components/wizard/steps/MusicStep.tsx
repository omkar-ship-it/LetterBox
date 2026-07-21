"use client";

import { useRef, useState } from "react";
import { Loader2, Music, Pause, Play, Upload, X } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";
import { uploadFile } from "@/lib/upload-client";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // matches /api/upload's own cap

export function MusicStep({
  musicTrackId,
  setMusicTrackId,
  musicUrl,
  musicName,
  setMusicUrl,
  setMusicName,
}: {
  musicTrackId: string | null;
  setMusicTrackId: (id: string | null) => void;
  musicUrl: string | null;
  musicName: string | null;
  setMusicUrl: (url: string | null) => void;
  setMusicName: (name: string | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  function pickPreset(id: string) {
    setMusicTrackId(id);
    setMusicUrl(null);
    setMusicName(null);
  }

  function clearMusic() {
    setMusicTrackId(null);
    setMusicUrl(null);
    setMusicName(null);
    if (previewing) {
      audioRef.current?.pause();
      setPreviewing(null);
    }
  }

  async function handleUpload(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("audio/")) {
      setUploadError("That doesn't look like an audio file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Keep it under 10MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setMusicTrackId(null);
      setMusicUrl(url);
      setMusicName(file.name);
    } catch {
      setUploadError("Upload failed — try again?");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">Music sets the pace of the reveal. Preview any track before choosing.</p>

      <div
        className={`flex items-center justify-between rounded-xl border-2 p-4 transition ${
          musicUrl ? "border-[#a8455a] bg-[#fdf1ee]" : "border-dashed border-stone-300 bg-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Music size={16} className="shrink-0 text-stone-400" />
          <div className="min-w-0">
            {musicUrl ? (
              <>
                <p className="truncate font-serif text-base text-[#2b2117]">{musicName ?? "Your track"}</p>
                <p className="text-xs uppercase tracking-wide text-stone-400">Uploaded · Custom</p>
              </>
            ) : (
              <p className="text-sm text-stone-500">Have a song in mind? Upload your own.</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {musicUrl && (
            <>
              <button
                type="button"
                onClick={() => togglePreview("custom", musicUrl)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                aria-label={previewing === "custom" ? "Pause preview" : "Play preview"}
              >
                {previewing === "custom" ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMusicUrl(null);
                  setMusicName(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                aria-label="Remove uploaded track"
              >
                <X size={13} />
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading…" : musicUrl ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
      {uploadError && <p className="text-[11px] text-red-500">{uploadError}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MUSIC_TRACKS.map((track) => {
          const selected = !musicUrl && track.id === musicTrackId;
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
                  onClick={() => pickPreset(track.id)}
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
        onClick={clearMusic}
        className="text-xs font-semibold text-stone-400 underline underline-offset-4 hover:text-stone-600"
      >
        No music, thanks
      </button>
      <audio ref={audioRef} onEnded={() => setPreviewing(null)} />
    </div>
  );
}
