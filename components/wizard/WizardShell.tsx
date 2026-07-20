"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { WIZARD_STEPS, STEP_LABELS, type WizardStep } from "./types";

export function WizardShell({
  step,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  hideFooter,
  preview,
  children,
}: {
  step: WizardStep;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideFooter?: boolean;
  preview: ReactNode;
  children: ReactNode;
}) {
  const index = WIZARD_STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-[#fbf6ef]">
      <header className="mx-auto grid max-w-6xl grid-cols-3 items-center px-6 py-5">
        <Link href="/" className="font-serif text-lg text-[#2b2117]">
          Letterbox
        </Link>
        <div className="hidden items-center justify-center gap-1.5 sm:flex">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-colors ${i <= index ? "bg-[#1c6b52]" : "bg-stone-200"}`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-24 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#a8455a]">
            Step {index + 1} of {WIZARD_STEPS.length}
          </p>
          <h1 className="mb-8 font-serif text-3xl text-[#2b2117] sm:text-4xl">{STEP_LABELS[step]}</h1>

          {children}

          {!hideFooter && (
            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={index === 0}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 disabled:opacity-0"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                onClick={onContinue}
                disabled={continueDisabled}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2b2117] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42352a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {continueLabel} <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {preview}
      </main>
    </div>
  );
}
