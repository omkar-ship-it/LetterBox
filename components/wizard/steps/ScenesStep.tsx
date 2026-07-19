"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { VoiceRecorder } from "@/components/wizard/VoiceRecorder";
import { LIGHT_PALETTE } from "@/lib/light-palette";
import { uploadFile } from "@/lib/upload-client";
import { SCENE_EYEBROW_MAX_LENGTH, SCENE_QUOTE_MAX_LENGTH, SCENE_DESCRIPTION_MAX_LENGTH } from "@/lib/schemas";
import type { SceneDraft } from "@/components/wizard/types";

export function ScenesStep({
  scenes,
  setScenes,
  accentColors,
  recipientName,
  tone,
  context,
}: {
  scenes: SceneDraft[];
  setScenes: (updater: (prev: SceneDraft[]) => SceneDraft[]) => void;
  accentColors: string[];
  recipientName: string;
  tone: string;
  context: string;
}) {
  function updateScene(id: string, patch: Partial<SceneDraft>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addScene() {
    setScenes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        eyebrow: "",
        quote: "",
        description: "",
        accentColor: accentColors[prev.length % accentColors.length],
        imageUrl: null,
        imageUploading: false,
        voiceNoteUrl: null,
        voiceUploading: false,
      },
    ]);
  }

  function removeScene(id: string) {
    setScenes((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  }

  async function handleImagePick(id: string, file: File) {
    updateScene(id, { imageUploading: true });
    try {
      const url = await uploadFile(file);
      updateScene(id, { imageUrl: url, imageUploading: false });
    } catch {
      updateScene(id, { imageUploading: false });
    }
  }

  async function handleVoiceRecorded(id: string, blob: Blob) {
    updateScene(id, { voiceUploading: true });
    try {
      const url = await uploadFile(blob, "voice-note.webm");
      updateScene(id, { voiceNoteUrl: url, voiceUploading: false });
    } catch {
      updateScene(id, { voiceUploading: false });
    }
  }

  return (
    <div className="space-y-6">
      {scenes.map((scene, i) => (
        <SceneCard
          key={scene.id}
          index={i}
          scene={scene}
          recipientName={recipientName}
          tone={tone}
          context={context}
          canRemove={scenes.length > 1}
          onChange={(patch) => updateScene(scene.id, patch)}
          onRemove={() => removeScene(scene.id)}
          onImagePick={(file) => handleImagePick(scene.id, file)}
          onVoiceRecorded={(blob) => handleVoiceRecorded(scene.id, blob)}
          onVoiceRemove={() => updateScene(scene.id, { voiceNoteUrl: null })}
        />
      ))}

      <button
        type="button"
        onClick={addScene}
        className="w-full rounded-xl border-2 border-dashed border-stone-300 py-4 text-sm font-semibold text-stone-500 transition hover:border-[#a8455a] hover:text-[#a8455a]"
      >
        + Add another scene
      </button>
    </div>
  );
}

function SceneCard({
  index,
  scene,
  recipientName,
  tone,
  context,
  canRemove,
  onChange,
  onRemove,
  onImagePick,
  onVoiceRecorded,
  onVoiceRemove,
}: {
  index: number;
  scene: SceneDraft;
  recipientName: string;
  tone: string;
  context: string;
  canRemove: boolean;
  onChange: (patch: Partial<SceneDraft>) => void;
  onRemove: () => void;
  onImagePick: (file: File) => void;
  onVoiceRecorded: (blob: Blob) => void;
  onVoiceRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  async function composeScene() {
    if (!recipientName.trim()) {
      setComposeError("Add their name on the first step — the muse needs someone to write to.");
      return;
    }
    setComposing(true);
    setComposeError(null);
    try {
      const res = await fetch("/api/compose-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, tone, context, eyebrow: scene.eyebrow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't compose right now.");
      onChange({ quote: data.quote, description: data.description });
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Couldn't compose right now.");
    } finally {
      setComposing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Card {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-stone-400 hover:text-red-500" aria-label="Remove scene">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
        <div className="space-y-3">
          <input
            value={scene.eyebrow}
            onChange={(e) => onChange({ eyebrow: e.target.value.slice(0, SCENE_EYEBROW_MAX_LENGTH) })}
            placeholder="Label (optional) — e.g. Steady"
            maxLength={SCENE_EYEBROW_MAX_LENGTH}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 focus:border-[#a8455a] focus:outline-none"
          />
          <div>
            <textarea
              value={scene.quote}
              onChange={(e) => onChange({ quote: e.target.value.slice(0, SCENE_QUOTE_MAX_LENGTH) })}
              placeholder="The line that says it — a quote or moment."
              rows={2}
              maxLength={SCENE_QUOTE_MAX_LENGTH}
              className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm italic focus:border-[#a8455a] focus:outline-none"
            />
            <p className="mt-1 text-right text-[10px] text-stone-400">
              {scene.quote.length}/{SCENE_QUOTE_MAX_LENGTH}
            </p>
          </div>
          <div>
            <textarea
              value={scene.description}
              onChange={(e) => onChange({ description: e.target.value.slice(0, SCENE_DESCRIPTION_MAX_LENGTH) })}
              placeholder="A little more detail (optional)."
              rows={2}
              maxLength={SCENE_DESCRIPTION_MAX_LENGTH}
              className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#a8455a] focus:outline-none"
            />
            <p className="mt-1 text-right text-[10px] text-stone-400">
              {scene.description.length}/{SCENE_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImagePick(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scene.imageUploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-60"
            >
              {scene.imageUploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              {scene.imageUploading ? "Uploading…" : scene.imageUrl ? "Replace photo" : "Upload photo"}
            </button>
            <button
              type="button"
              onClick={composeScene}
              disabled={composing}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-60"
            >
              {composing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {composing ? "Composing…" : "Compose with AI"}
            </button>
            <VoiceRecorder
              voiceNoteUrl={scene.voiceNoteUrl}
              uploading={scene.voiceUploading}
              onRecorded={onVoiceRecorded}
              onRemove={onVoiceRemove}
            />
          </div>
          {composeError && <p className="text-[11px] text-red-500">{composeError}</p>}

          <div>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-stone-400">Card color</span>
            <div className="flex flex-wrap gap-1.5">
              {LIGHT_PALETTE.map((color) => {
                const selected = scene.accentColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange({ accentColor: color })}
                    aria-label={`Set card color ${color}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full ring-offset-2 transition"
                    style={{ background: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined, outline: selected ? "2px solid #2b2117" : "none", outlineOffset: 2 }}
                  >
                    {selected && <Check size={12} className="text-black/50" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-stone-400">
            Keep it postcard-short — a line or two reads better than a paragraph. No photo? This scene becomes a
            full-color closing-style card instead — great for the last scene.
          </p>
        </div>

        <div
          className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl"
          style={{ background: scene.imageUrl ? undefined : `linear-gradient(160deg, ${scene.accentColor}, #2b2117)` }}
        >
          {scene.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- preview thumbnail for an uploaded/data-url image */}
              <img src={scene.imageUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange({ imageUrl: null })}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-wide text-white/80">Peak card</span>
          )}
        </div>
      </div>
    </div>
  );
}
