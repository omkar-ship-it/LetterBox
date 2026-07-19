"use client";

import { useState } from "react";
import { Check, Copy, Crown, Flame, Loader2, Send } from "lucide-react";

export function SendStep({
  senderName,
  setSenderName,
  recipientName,
  onPublish,
  onBack,
  publishing,
  publishError,
  shareUrl,
  isPremiumTemplate,
  templateName,
  onEditEnvelope,
  passcode,
  selfDestruct,
}: {
  senderName: string;
  setSenderName: (v: string) => void;
  recipientName: string;
  onPublish: () => void;
  onBack: () => void;
  publishing: boolean;
  publishError: string | null;
  shareUrl: string | null;
  isPremiumTemplate: boolean;
  templateName: string;
  onEditEnvelope: () => void;
  passcode: string | null;
  selfDestruct: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (shareUrl) {
    return (
      <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="font-serif text-2xl text-[#2b2117]">It&apos;s ready.</p>
        <p className="text-sm text-stone-500">Send this link to {recipientName || "them"} — no account needed on their end.</p>
        <div className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2">
          <span className="flex-1 truncate text-sm text-stone-600">{shareUrl}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2b2117] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#42352a]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {passcode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Don&apos;t forget the passcode</p>
            <p className="mt-1 text-sm text-amber-700">
              This letter needs <span className="font-mono font-semibold">{passcode}</span> to open — the link alone
              isn&apos;t enough. Share it with {recipientName || "them"} separately (a text, a call — not the same
              message as the link).
            </p>
          </div>
        )}
        {selfDestruct && (
          <div className="rounded-xl border border-stone-300 bg-stone-50 p-4 text-left">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-700">
              <Flame size={13} /> This letter will self-destruct
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Once {recipientName || "they"} finish{recipientName ? "es" : ""} reading it, it&apos;s gone for good —
              this link won&apos;t open again, not even for you.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => window.location.assign("/create")}
          className="inline-block text-sm font-semibold text-[#a8455a] underline underline-offset-4"
        >
          Create another letter
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <label className="block max-w-sm">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Your name</span>
        <input
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="How should they know it's from you?"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:border-[#a8455a] focus:outline-none"
        />
      </label>

      {isPremiumTemplate ? (
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
            <Crown size={15} /> {templateName} is a premium envelope
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Purchasing premium envelopes isn&apos;t available yet, so this letter can&apos;t be sent with it selected. Pick a free
            template to send now.
          </p>
          <button
            type="button"
            onClick={onEditEnvelope}
            className="mt-3 rounded-full bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900"
          >
            Choose a free envelope
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing || !senderName.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[#a8455a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f3a4c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {publishing ? "Sealing it up…" : "Send letter"}
        </button>
      )}
      {publishError && <p className="text-sm text-red-500">{publishError}</p>}

      <div>
        <button
          type="button"
          onClick={onBack}
          disabled={publishing}
          className="text-sm font-semibold text-stone-500 hover:text-stone-700 disabled:opacity-40"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
