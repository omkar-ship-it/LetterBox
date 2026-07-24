"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { OTP_LENGTH } from "@/lib/otp";

function nextParam(): string {
  if (typeof window === "undefined") return "/letters";
  return new URLSearchParams(window.location.search).get("next") || "/letters";
}

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't send the code — try again?");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the code — try again?");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode() {
    if (code.trim().length !== OTP_LENGTH) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "That code is wrong or expired.");
      window.location.assign(nextParam());
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is wrong or expired.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6ef] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8">
        <Link href="/" className="mb-6 block font-serif text-xl text-[#2b2117]">
          LetterMail
        </Link>

        {step === "email" ? (
          <>
            <p className="mb-1 flex items-center gap-1.5 font-serif text-lg text-[#2b2117]">
              <Mail size={17} className="text-[#a8455a]" /> Sign in with email
            </p>
            <p className="mb-5 text-sm text-stone-500">We&apos;ll send a one-time code — no password needed.</p>
            <input
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-[#a8455a] focus:outline-none"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              type="button"
              onClick={sendCode}
              disabled={submitting || !email.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2117] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? "Sending…" : "Send code"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-1 flex items-center gap-1.5 font-serif text-lg text-[#2b2117]">
              <ShieldCheck size={17} className="text-[#a8455a]" /> Enter the code
            </p>
            <p className="mb-5 text-sm text-stone-500">
              Sent to <span className="font-semibold text-[#2b2117]">{email}</span>. It expires in a few minutes.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              placeholder={"0".repeat(OTP_LENGTH)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-[#a8455a] focus:outline-none"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              type="button"
              onClick={verifyCode}
              disabled={submitting || code.length !== OTP_LENGTH}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2117] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? "Checking…" : "Verify & sign in"}
            </button>
            <div className="mt-4 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                className="font-semibold text-stone-500 hover:text-stone-700"
              >
                ← Use a different email
              </button>
              <button type="button" onClick={sendCode} disabled={submitting} className="font-semibold text-[#a8455a] hover:underline">
                Resend code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
