"use client";

import { useEffect, useState } from "react";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";
import { templateVars } from "./RevealExperience";
import styles from "./RevealExperience.module.css";

function splitRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function LockedCountdown({
  unlockAt,
  template,
  recipientName,
  onUnlocked,
}: {
  unlockAt: string;
  template: EnvelopeTemplate;
  recipientName: string;
  onUnlocked: () => void;
}) {
  const target = new Date(unlockAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const tick = () => {
      const next = target - Date.now();
      setRemaining(next);
      if (next <= 0) onUnlocked();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onUnlocked]);

  const { days, hours, minutes, seconds } = splitRemaining(remaining);

  return (
    <div className={styles.root} data-variant="fullscreen" style={templateVars(template)}
    >
      <div className={styles.deskGrain} />
      <div className={styles.envelopeShell}>
        <div className={styles.envelope}>
          <div className={`${styles.envTape}`} />
          <div className={`${styles.envBody} ${styles.paperFiber}`}>
            <div className={styles.envStamp}>
              <span className={styles.stampLabel}>{template.stampLabel}</span>
              <span className={styles.stampValue}>✦</span>
            </div>
            <div className={styles.envAddress}>
              <p className={styles.to}>To,</p>
              <p className={styles.name}>{recipientName}</p>
              <p className={styles.sub}>a letter is on its way</p>
            </div>
          </div>
          <div className={styles.envFlap} />
        </div>
      </div>
      <div
        className="fixed left-1/2 -translate-x-1/2 text-center"
        style={{ top: "calc(50% + 130px)", color: "var(--ink)" }}
      >
        <p
          className="mb-3 text-[0.66rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--gold)", fontFamily: "var(--font-body)" }}
        >
          this letter unlocks in
        </p>
        <div className="flex items-baseline justify-center gap-3">
          {[
            { label: "days", value: days },
            { label: "hrs", value: hours },
            { label: "min", value: minutes },
            { label: "sec", value: seconds },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <span className="font-serif text-3xl tabular-nums" style={{ color: "var(--ink)" }}>
                {pad(unit.value)}
              </span>
              <span
                className="text-[0.55rem] uppercase tracking-[0.12em]"
                style={{ color: "var(--ink-faint)", fontFamily: "var(--font-body)" }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
