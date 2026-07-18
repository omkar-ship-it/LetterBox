"use client";

import { useState, type FormEvent } from "react";
import { Lock, Loader2 } from "lucide-react";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";
import type { Card } from "@/lib/types";
import { templateVars, addressScale } from "./RevealExperience";
import type { CSSVars } from "@/lib/css-vars";
import { cn } from "@/lib/cn";
import styles from "./RevealExperience.module.css";

export function PasscodeGate({
  slug,
  template,
  recipientName,
  senderName,
  onUnlocked,
}: {
  slug: string;
  template: EnvelopeTemplate;
  recipientName: string;
  senderName: string;
  onUnlocked: (card: Card) => void;
}) {
  const [guess, setGuess] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${slug}/verify-passcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: guess.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "That's not the right passcode.");
        setChecking(false);
        return;
      }
      onUnlocked(data.card as Card);
    } catch {
      setError("Something went wrong — try again?");
      setChecking(false);
    }
  }

  return (
    <div className={styles.root} data-variant="fullscreen" style={templateVars(template)}>
      <div className={styles.deskGrain} />
      <div className={styles.envelopeShell}>
        <div className={styles.envelope}>
          {(template.decoration === "filigree" || template.decoration === "botanical") && (
            <div
              className={template.decoration === "filigree" ? styles.decorFiligree : styles.decorBotanical}
              style={{ "--decoration-color": template.decorationColor } as CSSVars}
            >
              <span className={cn(styles.decorCorner, styles.tl)} />
              <span className={cn(styles.decorCorner, styles.br)} />
            </div>
          )}
          {template.decoration === "confetti" && (
            <div className={styles.decorConfetti} style={{ "--decoration-color": template.decorationColor } as CSSVars} />
          )}
          <div className={styles.envTape} />
          <div className={cn(styles.envBody, styles.paperFiber)}>
            <div className={styles.envStamp}>
              <span className={styles.stampLabel}>{template.stampLabel}</span>
              <span className={styles.stampValue}>✦</span>
            </div>
            <div
              className={styles.envAddress}
              style={{ "--address-scale": addressScale(recipientName, `from ${senderName}`) } as CSSVars}
            >
              <p className={styles.to}>To,</p>
              <p className={styles.name}>{recipientName}</p>
              <p className={styles.sub}>from {senderName}</p>
            </div>
          </div>
          <div className={styles.envFlap} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed left-1/2 w-[min(320px,88vw)] -translate-x-1/2 text-center"
        style={{ top: "calc(50% + 130px)", color: "var(--ink)" }}
      >
        <p
          className="mb-3 flex items-center justify-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--gold)", fontFamily: "var(--font-body)" }}
        >
          <Lock size={12} /> this letter needs a passcode
        </p>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value);
            setError(null);
          }}
          placeholder="Enter passcode"
          className="w-full rounded-xl border px-4 py-3 text-center text-sm focus:outline-none"
          style={{
            borderColor: error ? "#c23a6b" : "var(--env-shadow)",
            background: "rgba(255,255,255,0.6)",
            color: "var(--ink)",
          }}
        />
        {error && (
          <p className="mt-2 text-xs font-semibold" style={{ color: "#c23a6b" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!guess.trim() || checking}
          className="mt-3 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--ink)" }}
        >
          {checking ? <Loader2 size={15} className="animate-spin" /> : null}
          {checking ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
