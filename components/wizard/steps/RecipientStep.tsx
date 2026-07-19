"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { MESSAGE_MAX_LENGTH } from "@/lib/schemas";

const TONES = ["warm", "heartfelt", "playful", "proud", "encouraging", "nostalgic"];

export function RecipientStep({
  recipientName,
  setRecipientName,
  tone,
  setTone,
  context,
  setContext,
  title,
  setTitle,
  message,
  setMessage,
}: {
  recipientName: string;
  setRecipientName: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  context: string;
  setContext: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
}) {
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  async function composeWithAI() {
    if (!recipientName.trim()) {
      setComposeError("Add their name first — the muse needs someone to write to.");
      return;
    }
    setComposing(true);
    setComposeError(null);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, tone, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't compose right now.");
      setTitle(data.title);
      setMessage(data.message);
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Couldn't compose right now.");
    } finally {
      setComposing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Recipient&apos;s name</span>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Maya"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:border-[#a8455a] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Tone</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm capitalize focus:border-[#a8455a] focus:outline-none"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
          Any context for the muse? (optional)
        </span>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="They stayed up late helping me with the pitch."
          rows={2}
          className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:border-[#a8455a] focus:outline-none"
        />
      </label>

      <div>
        <button
          type="button"
          onClick={composeWithAI}
          disabled={composing}
          className="inline-flex items-center gap-2 rounded-full border border-[#d9b3a8] bg-white px-4 py-2 text-sm font-semibold text-[#a8455a] transition hover:bg-[#fdf1ee] disabled:opacity-60"
        >
          {composing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {composing ? "Composing…" : "Compose with AI"}
        </button>
        {composeError && <p className="mt-2 text-xs text-red-500">{composeError}</p>}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Card title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A short poetic title"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:border-[#a8455a] focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Your message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
          placeholder="Say the thing. It doesn't have to be perfect — it has to be true."
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm italic focus:border-[#a8455a] focus:outline-none"
        />
        <p className="mt-1 text-right text-[10px] text-stone-400">
          {message.length}/{MESSAGE_MAX_LENGTH} — this is what shows on the envelope face, keep it a preview
        </p>
      </label>
    </div>
  );
}
