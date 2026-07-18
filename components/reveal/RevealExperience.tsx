"use client";

import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent, type MouseEvent as ReactMouseEvent } from "react";
import { Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { EnvelopeTemplate } from "@/lib/envelope-templates";
import type { Scene } from "@/lib/types";
import type { CSSVars } from "@/lib/css-vars";
import { cn } from "@/lib/cn";
import styles from "./RevealExperience.module.css";

type Slot = "front" | "peek1" | "peek2" | "peek2-enter" | "gather-out" | "gather-in";
type StackEntry = { key: number; sceneIndex: number; slot: Slot };

const SLOT_CLASS: Record<Slot, string> = {
  front: styles.slotFront,
  peek1: styles.slotPeek1,
  peek2: styles.slotPeek2,
  "peek2-enter": styles.slotPeek2Enter,
  "gather-out": styles.gatherOutAnim,
  "gather-in": styles.gatherInAnim,
};

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1108.7].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Web Audio unavailable — silently skip the chime, it's a nicety.
  }
}

/** Longer real letters were getting silently clipped by the fixed-size
 * postcard (confirmed on a real device). Three iterations: shrinking font
 * alone got unreadable; growing the card freely taller looked like a
 * portrait strip instead of a postcard; switching to a photo-on-top layout
 * for long scenes fixed the fit but lost the original side-by-side look.
 * Landed here: always side-by-side, the card grows up to square (never
 * taller than wide — see stageAspectRatio), and .pcDesc's CSS line-clamp
 * is the final safety net for text too long to fit even then. */
function contentScale(...text: string[]): number {
  const len = text.reduce((sum, t) => sum + t.length, 0);
  if (len <= 70) return 1;
  if (len <= 160) return 0.92;
  if (len <= 260) return 0.86;
  return 0.8;
}

/** Capped at 1/1 — never taller than wide, so it still reads as a postcard
 * rather than a portrait strip, regardless of how long the text gets. */
function stageAspectRatio(...text: string[]): string {
  const len = text.reduce((sum, t) => sum + t.length, 0);
  if (len <= 70) return "3 / 2";
  if (len <= 160) return "4 / 3";
  return "1 / 1";
}

/** The envelope's address block grows upward from a fixed bottom edge (it
 * sits above the wax seal), so long names/messages risk growing tall enough
 * to visually run under the seal graphic — same "don't hide what they
 * wrote" principle as the postcard fix, applied here to keep the block
 * short instead. */
export function addressScale(name: string, sub: string): number {
  const len = name.length + sub.length;
  if (len <= 40) return 1;
  if (len <= 70) return 0.85;
  if (len <= 110) return 0.72;
  if (len <= 160) return 0.62;
  return 0.54;
}

export function templateVars(template: EnvelopeTemplate): CSSVars {
  return {
    "--desk": template.colors.desk,
    "--ink": template.colors.ink,
    "--ink-soft": template.colors.inkSoft,
    "--ink-faint": template.colors.inkFaint,
    "--env-paper": template.colors.envPaper,
    "--env-paper-2": template.colors.envPaper2,
    "--env-paper-3": template.colors.envPaper3,
    "--env-shadow": template.colors.envShadow,
    "--seal": template.colors.seal,
    "--seal-light": template.colors.sealLight,
    "--seal-dark": template.colors.sealDark,
    "--gold": template.colors.gold,
    "--tape": template.colors.tape,
    "--tape-2": template.colors.tape2,
  };
}

function VoiceButton({
  scene,
  active,
  onToggle,
}: {
  scene: Scene;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(styles.pcVoice, active && styles.playing)}
      style={{ "--scene": scene.accentColor } as CSSVars}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? "Pause voice note" : "Play voice note"}
    >
      <span className={styles.pcVoiceIconPlay}>
        <Play size={11} fill="currentColor" />
      </span>
      <span className={styles.pcVoiceIconPause}>
        <Pause size={11} fill="currentColor" />
      </span>
      <span className={styles.pcVoiceLabel}>voice note</span>
      <span className={styles.pcVoiceWave}>
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

export function RevealExperience({
  variant,
  template,
  senderName,
  recipientName,
  message,
  closingLine,
  scenes,
  musicUrl,
  onOpened,
}: {
  variant: "fullscreen" | "contained";
  template: EnvelopeTemplate;
  senderName: string;
  recipientName: string;
  message?: string;
  closingLine?: string;
  scenes: Scene[];
  musicUrl?: string | null;
  onOpened?: () => void;
}) {
  const envelopeRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);
  const nextKeyRef = useRef(3);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedRef = useRef(false);
  const finishingRef = useRef(false);

  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const [current, setCurrent] = useState(0);
  const [visibleCards, setVisibleCards] = useState<StackEntry[]>(() =>
    scenes.slice(0, 3).map((_, i) => ({ key: i, sceneIndex: i, slot: (i === 0 ? "front" : i === 1 ? "peek1" : "peek2") as Slot }))
  );
  const [flyVars, setFlyVars] = useState<Record<number, { tx: number; ty: number }>>({});
  const [receiving, setReceiving] = useState(false);

  const [sealCracked, setSealCracked] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [envCorner, setEnvCorner] = useState(false);
  const [envHideDetails, setEnvHideDetails] = useState(false);
  const [deckActive, setDeckActive] = useState(false);
  const [gateHidden, setGateHidden] = useState(false);
  const [soundShown, setSoundShown] = useState(false);
  const [closingShown, setClosingShown] = useState(false);

  const [musicStarted, setMusicStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  function computeFlyVars() {
    const envRect = envelopeRef.current?.getBoundingClientRect();
    const stageRect = stageRef.current?.getBoundingClientRect();
    if (!envRect || !stageRect) return { tx: -180, ty: 260 };
    return {
      tx: envRect.left + envRect.width / 2 - (stageRect.left + stageRect.width / 2),
      ty: envRect.top + envRect.height / 2 - (stageRect.top + stageRect.height / 2),
    };
  }

  function pulseEnvelope() {
    if (reduced) return;
    setReceiving(false);
    requestAnimationFrame(() => {
      setReceiving(true);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setReceiving(false), 550);
    });
  }

  function startMusic() {
    if (musicStarted) return;
    setMusicStarted(true);
    setMusicOn(true);
    const audio = bgAudioRef.current;
    if (audio && musicUrl) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }

  function toggleMusic() {
    if (!musicStarted) {
      startMusic();
      return;
    }
    const audio = bgAudioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio.play().catch(() => {});
      setMusicOn(true);
    }
  }

  function duckMusic(active: boolean) {
    const audio = bgAudioRef.current;
    if (audio) audio.volume = active ? 0.12 : 0.5;
  }

  function toggleVoice(scene: Scene) {
    if (!scene.voiceNoteUrl) return;
    if (!musicStarted) startMusic();
    const audio = voiceAudioRef.current;
    if (!audio) return;
    if (activeVoiceId === scene.id) {
      audio.pause();
      setActiveVoiceId(null);
      duckMusic(false);
      return;
    }
    audio.src = scene.voiceNoteUrl;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setActiveVoiceId(scene.id);
    duckMusic(true);
  }

  useEffect(() => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setActiveVoiceId(null);
      duckMusic(false);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  function openEnvelope() {
    if (openedRef.current) return;
    openedRef.current = true;
    setSealCracked(true);
    startMusic();
    setTimeout(() => setFlapOpen(true), 350);
    setTimeout(
      () => {
        setGateHidden(true);
        setEnvCorner(true);
        setEnvHideDetails(true);
        setDeckActive(true);
        setSoundShown(true);
      },
      reduced ? 300 : 2100
    );
    onOpened?.();
  }

  function goNext() {
    if (current >= scenes.length - 1) {
      finishDeck();
      return;
    }
    const frontEntry = visibleCards.find((c) => c.slot === "front");
    const vars = frontEntry ? computeFlyVars() : null;

    setVisibleCards((prev) => {
      let next: StackEntry[] = reduced
        ? prev.filter((c) => c.slot !== "front")
        : prev.map((c) => (c.slot === "front" ? { ...c, slot: "gather-out" as Slot } : c));
      next = next.map((c) => {
        if (c.slot === "peek1") return { ...c, slot: "front" as Slot };
        if (c.slot === "peek2") return { ...c, slot: "peek1" as Slot };
        return c;
      });
      const newDeepIndex = current + 3;
      if (newDeepIndex < scenes.length) {
        const key = nextKeyRef.current++;
        next = [...next, { key, sceneIndex: newDeepIndex, slot: (reduced ? "peek2" : "peek2-enter") as Slot }];
        if (!reduced) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setVisibleCards((p) => p.map((c) => (c.key === key ? { ...c, slot: "peek2" as Slot } : c)));
            });
          });
        }
      }
      return next;
    });

    if (frontEntry && vars) setFlyVars((v) => ({ ...v, [frontEntry.key]: vars }));
    if (!reduced) pulseEnvelope();
    setCurrent((c) => c + 1);
  }

  function goPrev() {
    if (current <= 0) return;
    const vars = computeFlyVars();
    const enteringSceneIndex = current - 1;
    const enteringKey = nextKeyRef.current++;

    setVisibleCards((prev) => {
      let next = prev.filter((c) => c.slot !== "peek2");
      next = next.map((c) => {
        if (c.slot === "peek1") return { ...c, slot: "peek2" as Slot };
        if (c.slot === "front") return { ...c, slot: "peek1" as Slot };
        return c;
      });
      next = [...next, { key: enteringKey, sceneIndex: enteringSceneIndex, slot: (reduced ? "front" : "gather-in") as Slot }];
      return next;
    });
    if (!reduced) setFlyVars((v) => ({ ...v, [enteringKey]: vars }));
    setCurrent((c) => c - 1);
  }

  function finishDeck() {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const frontEntry = visibleCards.find((c) => c.slot === "front");
    if (frontEntry) {
      if (reduced) {
        setVisibleCards((prev) => prev.filter((c) => c.key !== frontEntry.key));
      } else {
        const vars = computeFlyVars();
        setFlyVars((v) => ({ ...v, [frontEntry.key]: vars }));
        setVisibleCards((prev) => prev.map((c) => (c.key === frontEntry.key ? { ...c, slot: "gather-out" as Slot } : c)));
      }
    }

    setTimeout(
      () => {
        setDeckActive(false);
        setEnvCorner(false);
        setEnvHideDetails(false);
        setTimeout(
          () => {
            setFlapOpen(false);
            setTimeout(
              () => {
                setSealCracked(false);
                playChime();
                setClosingShown(true);
              },
              reduced ? 100 : 950
            );
          },
          reduced ? 100 : 1150
        );
      },
      reduced ? 200 : 1020
    );
  }

  const touchStartXRef = useRef<number | null>(null);
  function handleTouchStart(e: ReactTouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: ReactTouchEvent) {
    if (touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < -40) goNext();
    else goPrev();
  }
  function handleStageClick(e: ReactMouseEvent) {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) goNext();
    else goPrev();
  }

  const atPeak = current === scenes.length - 1;
  const frontScene = scenes[current];
  const stageStyle: CSSVars | undefined = frontScene
    ? { "--stage-ratio": stageAspectRatio(frontScene.quote, frontScene.imageUrl ? frontScene.description : "") }
    : undefined;

  return (
    <div className={styles.root} data-variant={variant} style={templateVars(template)}>
      <div className={styles.deskGrain} />

      <button
        type="button"
        className={cn(styles.soundToggle, soundShown && styles.shown)}
        onClick={toggleMusic}
        aria-label={musicOn ? "Mute music" : "Unmute music"}
        aria-pressed={!musicOn}
      >
        {musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>

      <div
        ref={envelopeRef}
        className={cn(styles.envelopeShell, envCorner && styles.corner, envHideDetails && styles.hideDetails, receiving && styles.receiving)}
      >
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
              style={{ "--address-scale": addressScale(recipientName, message || "a letter, with love") } as CSSVars}
            >
              <p className={styles.to}>To,</p>
              <p className={styles.name}>{recipientName}</p>
              <p className={styles.sub}>{message || "a letter, with love"}</p>
            </div>
          </div>
          <div className={cn(styles.envFlap, styles.paperFiber, flapOpen && styles.open)} />
          <div
            className={cn(styles.envSealWrap, sealCracked && styles.cracked)}
            role="button"
            tabIndex={0}
            aria-label="Break the wax seal and open the letter"
            onClick={openEnvelope}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEnvelope();
              }
            }}
          >
            <span className={styles.sealGlow} />
            <span className={styles.sealLegs}>
              <span />
              <span />
            </span>
            <span className={cn(styles.sealHalf, styles.l)} />
            <span className={cn(styles.sealHalf, styles.r)} />
            <span className={styles.envSealMark}>
              <Heart size={24} fill="currentColor" />
            </span>
          </div>
        </div>
      </div>

      <div className={cn(styles.gate, gateHidden && styles.hidden)}>
        <p className={styles.gateCaption}>{template.tagline}</p>
      </div>

      <div className={cn(styles.deckScene, deckActive && styles.active)}>
        <div
          className={styles.postcardStage}
          style={stageStyle}
          ref={stageRef}
          onClick={handleStageClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {visibleCards.map((entry) => {
            const scene = scenes[entry.sceneIndex];
            if (!scene) return null;
            const isPeak = !scene.imageUrl;
            const vars = flyVars[entry.key];
            const style: CSSVars = {
              "--scene": scene.accentColor,
              // inherited by .pcQuote/.pcDesc below — set once here rather than per-element
              "--content-scale": contentScale(scene.quote, isPeak ? "" : scene.description),
              ...(vars ? { "--tx": `${vars.tx}px`, "--ty": `${vars.ty}px` } : {}),
            };
            return (
              <div
                key={entry.key}
                className={cn(styles.postcard, SLOT_CLASS[entry.slot], isPeak && styles.peak)}
                style={style}
                onAnimationEnd={() => {
                  if (entry.slot === "gather-out") {
                    setVisibleCards((prev) => prev.filter((c) => c.key !== entry.key));
                    pulseEnvelope();
                  } else if (entry.slot === "gather-in") {
                    setVisibleCards((prev) => prev.map((c) => (c.key === entry.key ? { ...c, slot: "front" as Slot } : c)));
                  }
                }}
              >
                {isPeak ? (
                  <div className={styles.pcPeak}>
                    <p className={styles.pcQuote}>{scene.quote}</p>
                    {scene.voiceNoteUrl && (
                      <VoiceButton scene={scene} active={activeVoiceId === scene.id} onToggle={() => toggleVoice(scene)} />
                    )}
                  </div>
                ) : (
                  <>
                    <div className={styles.pcPhotoWrap}>
                      {scene.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary Blob URLs inside a hand-animated card, next/image's domain allowlist isn't worth it here
                        <img className={styles.pcBg} src={scene.imageUrl} alt="" />
                      )}
                    </div>
                    <div className={styles.pcAccent} />
                    <div className={styles.pcContent}>
                      {scene.eyebrow && <p className={styles.pcEyebrow}>{scene.eyebrow}</p>}
                      <p className={styles.pcQuote}>{scene.quote}</p>
                      {scene.description && <p className={styles.pcDesc}>{scene.description}</p>}
                      {scene.voiceNoteUrl && (
                        <VoiceButton scene={scene} active={activeVoiceId === scene.id} onToggle={() => toggleVoice(scene)} />
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className={styles.deckHint} style={{ opacity: 0.8 }}>
          {atPeak ? "tap to close the letter" : "tap or swipe to continue"}
        </p>
      </div>

      <div className={cn(styles.closingText, closingShown && styles.shown)}>
        <p className={styles.closingLine}>{closingLine || "Thank you for being you."}</p>
        <p className={styles.closingSub}>{senderName ? `kept, for you — ${senderName}` : "kept, for you"}</p>
      </div>

      <audio ref={bgAudioRef} src={musicUrl ?? undefined} loop />
      <audio ref={voiceAudioRef} />
    </div>
  );
}
