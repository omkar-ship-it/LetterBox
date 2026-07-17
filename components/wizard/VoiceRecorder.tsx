"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Loader2 } from "lucide-react";

export function VoiceRecorder({
  voiceNoteUrl,
  uploading,
  onRecorded,
  onRemove,
}: {
  voiceNoteUrl: string | null;
  uploading?: boolean;
  onRecorded: (blob: Blob) => void;
  onRemove: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        onRecorded(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Couldn't access your microphone — check your browser's permission settings.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  if (voiceNoteUrl && !recording) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs">
        <audio controls src={voiceNoteUrl} className="h-7 max-w-[160px]" />
        {uploading && <Loader2 size={14} className="animate-spin text-stone-400" />}
        <button
          type="button"
          onClick={onRemove}
          className="text-stone-400 hover:text-red-500"
          aria-label="Remove voice note"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          recording ? "border-red-300 bg-red-50 text-red-600" : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
        }`}
      >
        {recording ? <Square size={12} fill="currentColor" /> : <Mic size={13} />}
        {recording ? `Recording… ${seconds}s` : uploading ? "Uploading…" : "Record a voice note"}
      </button>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
