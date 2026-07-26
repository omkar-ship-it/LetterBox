"use client";

import { useMemo, useState } from "react";
import { WizardShell } from "./WizardShell";
import { PhonePreview } from "./PhonePreview";
import { RecipientStep } from "./steps/RecipientStep";
import { ScenesStep } from "./steps/ScenesStep";
import { EnvelopeStep } from "./steps/EnvelopeStep";
import { MusicStep } from "./steps/MusicStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { SendStep } from "./steps/SendStep";
import { WIZARD_STEPS, type SceneDraft } from "./types";
import { ENVELOPE_TEMPLATES, getEnvelopeTemplate } from "@/lib/envelope-templates";
import { MUSIC_TRACKS } from "@/lib/music";
import { PASSCODE_MIN_LENGTH } from "@/lib/schemas";
import type { Scene, SealType } from "@/lib/types";

function newScene(accentColor: string): SceneDraft {
  return {
    id: crypto.randomUUID(),
    eyebrow: "",
    quote: "",
    description: "",
    accentColor,
    imageUrl: null,
    imageUploading: false,
    voiceNoteUrl: null,
    voiceUploading: false,
  };
}

export function CreateWizard({
  accountEmail,
  initialTemplateId,
}: {
  accountEmail: string;
  initialTemplateId?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = WIZARD_STEPS[stepIndex];

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [tone, setTone] = useState("warm");
  const [context, setContext] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  const [envelopeTemplateId, setEnvelopeTemplateId] = useState(initialTemplateId ?? ENVELOPE_TEMPLATES[0].id);
  const template = useMemo(() => getEnvelopeTemplate(envelopeTemplateId), [envelopeTemplateId]);

  const [scenes, setScenes] = useState<SceneDraft[]>(() => [newScene(template.accentColors[0])]);
  const [musicTrackId, setMusicTrackId] = useState<string | null>(MUSIC_TRACKS[0].id);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);

  const [sealType, setSealType] = useState<SealType | null>(null);
  const [sealText, setSealText] = useState("");
  const [sealLogoUrl, setSealLogoUrl] = useState<string | null>(null);

  const [scheduled, setScheduled] = useState(false);
  const [unlockAtLocal, setUnlockAtLocal] = useState("");
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [selfDestruct, setSelfDestruct] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const previewScenes: Scene[] = scenes.map((s, i) => ({
    id: s.id,
    order: i,
    eyebrow: s.eyebrow,
    quote: s.quote || "Your words will glow here.",
    description: s.description,
    imageUrl: s.imageUrl,
    voiceNoteUrl: s.voiceNoteUrl,
    accentColor: s.accentColor,
  }));

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }
  function goNext() {
    setStepIndex((i) => Math.min(WIZARD_STEPS.length - 1, i + 1));
  }

  const canContinue = (() => {
    if (step === "recipient") return recipientName.trim().length > 0;
    if (step === "scenes") return scenes.some((s) => s.quote.trim().length > 0);
    if (step === "schedule") {
      if (scheduled && !unlockAtLocal) return false;
      if (passcodeEnabled && passcode.trim().length < PASSCODE_MIN_LENGTH) return false;
      return true;
    }
    return true;
  })();

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    try {
      const cleanScenes = scenes.filter((s) => s.quote.trim().length > 0);
      // Only send a seal customization if it's actually complete — picking
      // "Initials" but leaving the field blank, or "Logo" mid-upload,
      // should fall back to the template's default mark, not a half-set state.
      const effectiveSealType: SealType | null =
        sealType === "letters" && sealText.trim() ? "letters" : sealType === "logo" && sealLogoUrl ? "logo" : null;
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          recipientName,
          recipientEmails,
          tone,
          title,
          message,
          envelopeTemplateId,
          musicTrackId,
          musicUrl,
          musicName,
          sealType: effectiveSealType,
          sealText: effectiveSealType === "letters" ? sealText.trim() : null,
          sealLogoUrl: effectiveSealType === "logo" ? sealLogoUrl : null,
          unlockAt: scheduled && unlockAtLocal ? new Date(unlockAtLocal).toISOString() : null,
          passcode: passcodeEnabled && passcode.trim() ? passcode.trim() : null,
          selfDestruct,
          scenes: cleanScenes.map((s) => ({
            eyebrow: s.eyebrow,
            quote: s.quote,
            description: s.description,
            imageUrl: s.imageUrl,
            voiceNoteUrl: s.voiceNoteUrl,
            accentColor: s.accentColor,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldMessage = data?.error?.fieldErrors
          ? (Object.values(data.error.fieldErrors).flat()[0] as string | undefined)
          : undefined;
        throw new Error(data?.error?.formErrors?.[0] ?? fieldMessage ?? "Something went wrong — try again?");
      }
      setShareUrl(`${window.location.origin}/c/${data.card.slug}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong — try again?");
    } finally {
      setPublishing(false);
    }
  }

  const preview = (
    <PhonePreview
      template={template}
      senderName={senderName}
      recipientName={recipientName}
      message={message}
      closingLine={title}
      scenes={previewScenes}
      sealType={sealType}
      sealText={sealText}
      sealLogoUrl={sealLogoUrl}
    />
  );

  return (
    <WizardShell
      step={step}
      onBack={goBack}
      onContinue={goNext}
      continueDisabled={!canContinue}
      hideFooter={step === "send"}
      preview={preview}
    >
      {step === "envelope" && (
        <EnvelopeStep
          envelopeTemplateId={envelopeTemplateId}
          setEnvelopeTemplateId={setEnvelopeTemplateId}
          sealType={sealType}
          setSealType={setSealType}
          sealText={sealText}
          setSealText={setSealText}
          sealLogoUrl={sealLogoUrl}
          setSealLogoUrl={setSealLogoUrl}
        />
      )}
      {step === "recipient" && (
        <RecipientStep
          recipientName={recipientName}
          setRecipientName={setRecipientName}
          recipientEmails={recipientEmails}
          setRecipientEmails={setRecipientEmails}
          tone={tone}
          setTone={setTone}
          context={context}
          setContext={setContext}
          title={title}
          setTitle={setTitle}
          message={message}
          setMessage={setMessage}
        />
      )}
      {step === "scenes" && (
        <ScenesStep
          scenes={scenes}
          setScenes={setScenes}
          accentColors={template.accentColors}
          recipientName={recipientName}
          tone={tone}
          context={context}
        />
      )}
      {step === "music" && (
        <MusicStep
          musicTrackId={musicTrackId}
          setMusicTrackId={setMusicTrackId}
          musicUrl={musicUrl}
          musicName={musicName}
          setMusicUrl={setMusicUrl}
          setMusicName={setMusicName}
        />
      )}
      {step === "schedule" && (
        <ScheduleStep
          scheduled={scheduled}
          setScheduled={setScheduled}
          unlockAtLocal={unlockAtLocal}
          setUnlockAtLocal={setUnlockAtLocal}
          passcodeEnabled={passcodeEnabled}
          setPasscodeEnabled={setPasscodeEnabled}
          passcode={passcode}
          setPasscode={setPasscode}
          selfDestruct={selfDestruct}
          setSelfDestruct={setSelfDestruct}
        />
      )}
      {step === "send" && (
        <SendStep
          senderName={senderName}
          setSenderName={setSenderName}
          recipientName={recipientName}
          onPublish={handlePublish}
          onBack={goBack}
          publishing={publishing}
          publishError={publishError}
          shareUrl={shareUrl}
          passcode={passcodeEnabled && passcode.trim() ? passcode.trim() : null}
          selfDestruct={selfDestruct}
          accountEmail={accountEmail}
          recipientEmails={recipientEmails}
        />
      )}
    </WizardShell>
  );
}
