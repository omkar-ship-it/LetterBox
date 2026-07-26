"use client";

import { useRef, useState } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import { ENVELOPE_TEMPLATES, type EnvelopeTemplate } from "@/lib/envelope-templates";
import { EnvelopeSwatch } from "@/components/marketing/EnvelopeSwatch";
import { uploadFile } from "@/lib/upload-client";
import { SEAL_TEXT_MAX_LENGTH } from "@/lib/schemas";
import type { SealType } from "@/lib/types";

const MAX_LOGO_BYTES = 10 * 1024 * 1024; // matches /api/upload's own cap

function TemplateCard({
  t,
  selected,
  onSelect,
}: {
  t: EnvelopeTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
        selected ? "border-[#a8455a]" : "border-stone-200 hover:border-stone-300"
      }`}
      style={{ background: t.colors.desk }}
    >
      {selected && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#a8455a] p-1 text-white">
          <Check size={12} />
        </span>
      )}
      <div className="mb-3">
        <EnvelopeSwatch template={t} />
      </div>
      <p className="font-serif text-lg" style={{ color: t.colors.ink }}>
        {t.name}
      </p>
      <p className="mt-1 text-xs" style={{ color: t.colors.inkSoft }}>
        {t.description}
      </p>
      <div className="mt-3 flex gap-1.5">
        {[t.colors.envPaper, t.colors.seal, t.colors.tape, t.colors.gold].map((c, i) => (
          <span key={i} className="h-3 w-3 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </button>
  );
}

const SEAL_OPTIONS: { value: SealType | null; label: string }[] = [
  { value: null, label: "Default" },
  { value: "letters", label: "Initials" },
  { value: "logo", label: "Logo" },
];

function SealPersonalizer({
  sealType,
  setSealType,
  sealText,
  setSealText,
  sealLogoUrl,
  setSealLogoUrl,
}: {
  sealType: SealType | null;
  setSealType: (v: SealType | null) => void;
  sealText: string;
  setSealText: (v: string) => void;
  sealLogoUrl: string | null;
  setSealLogoUrl: (v: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("That doesn't look like an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setUploadError("Keep it under 10MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setSealLogoUrl(url);
    } catch {
      setUploadError("Upload failed — try again?");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Wax seal</p>
      <p className="mb-4 text-xs text-stone-400">
        Personalize the seal with your initials or a logo — free to try for now while we figure out if it&apos;s worth a premium tag.
      </p>
      <div className="flex flex-wrap gap-2">
        {SEAL_OPTIONS.map((opt) => {
          const selected = opt.value === sealType;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSealType(opt.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selected ? "bg-[#a8455a] text-white" : "border border-stone-300 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {sealType === "letters" && (
        <div className="mt-4 max-w-[180px]">
          <input
            value={sealText}
            onChange={(e) => setSealText(e.target.value.slice(0, SEAL_TEXT_MAX_LENGTH).toUpperCase())}
            placeholder="e.g. A&J"
            maxLength={SEAL_TEXT_MAX_LENGTH}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-lg font-semibold uppercase tracking-widest focus:border-[#a8455a] focus:outline-none"
          />
          <p className="mt-1 text-right text-[10px] text-stone-400">
            {sealText.length}/{SEAL_TEXT_MAX_LENGTH}
          </p>
        </div>
      )}

      {sealType === "logo" && (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            {sealLogoUrl ? (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-[#2b2117] bg-cover bg-center"
                style={{ backgroundImage: `url(${sealLogoUrl})`, backgroundSize: "60%", backgroundRepeat: "no-repeat" }}
              />
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
              {uploading ? "Uploading…" : sealLogoUrl ? "Replace logo" : "Upload logo"}
            </button>
            {sealLogoUrl && (
              <button
                type="button"
                onClick={() => setSealLogoUrl(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
                aria-label="Remove logo"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            Best with a simple, high-contrast mark — it&apos;s converted into a single-color embossed silhouette, not shown in full
            color.
          </p>
          {uploadError && <p className="mt-1 text-[11px] text-red-500">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}

export function EnvelopeStep({
  envelopeTemplateId,
  setEnvelopeTemplateId,
  sealType,
  setSealType,
  sealText,
  setSealText,
  sealLogoUrl,
  setSealLogoUrl,
}: {
  envelopeTemplateId: string;
  setEnvelopeTemplateId: (id: string) => void;
  sealType: SealType | null;
  setSealType: (v: SealType | null) => void;
  sealText: string;
  setSealText: (v: string) => void;
  sealLogoUrl: string | null;
  setSealLogoUrl: (v: string | null) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ENVELOPE_TEMPLATES.map((t) => (
          <TemplateCard key={t.id} t={t} selected={t.id === envelopeTemplateId} onSelect={() => setEnvelopeTemplateId(t.id)} />
        ))}
      </div>

      <SealPersonalizer
        sealType={sealType}
        setSealType={setSealType}
        sealText={sealText}
        setSealText={setSealText}
        sealLogoUrl={sealLogoUrl}
        setSealLogoUrl={setSealLogoUrl}
      />
    </div>
  );
}
