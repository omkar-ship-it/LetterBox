"use client";

import { Clock, Send } from "lucide-react";

function minDateTimeLocal() {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setSeconds(0, 0);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function ScheduleStep({
  scheduled,
  setScheduled,
  unlockAtLocal,
  setUnlockAtLocal,
}: {
  scheduled: boolean;
  setScheduled: (v: boolean) => void;
  unlockAtLocal: string;
  setUnlockAtLocal: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setScheduled(false)}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            !scheduled ? "border-[#a8455a] bg-[#fdf1ee]" : "border-stone-200 bg-white"
          }`}
        >
          <Send size={18} className="mt-0.5 text-[#a8455a]" />
          <div>
            <p className="font-semibold text-[#2b2117]">Send right away</p>
            <p className="text-xs text-stone-500">They can open it the moment they get the link.</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setScheduled(true)}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
            scheduled ? "border-[#a8455a] bg-[#fdf1ee]" : "border-stone-200 bg-white"
          }`}
        >
          <Clock size={18} className="mt-0.5 text-[#a8455a]" />
          <div>
            <p className="font-semibold text-[#2b2117]">Unlock at a specific moment</p>
            <p className="text-xs text-stone-500">A countdown shows until then — perfect for birthdays and anniversaries.</p>
          </div>
        </button>
      </div>

      {scheduled && (
        <label className="block max-w-xs">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Unlocks on</span>
          <input
            type="datetime-local"
            value={unlockAtLocal}
            min={minDateTimeLocal()}
            onChange={(e) => setUnlockAtLocal(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:border-[#a8455a] focus:outline-none"
          />
        </label>
      )}
    </div>
  );
}
