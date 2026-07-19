import Link from "next/link";
import { Heart, Mail, Mic, Music2, PartyPopper, Sparkles, Timer } from "lucide-react";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { ENVELOPE_TEMPLATES } from "@/lib/envelope-templates";
import { getSessionUser } from "@/lib/session";

const USE_CASES = [
  { icon: Heart, label: "Thank someone", copy: "For the person who always shows up and never asks for credit." },
  { icon: PartyPopper, label: "Celebrate a milestone", copy: "A birthday, a promotion, a new home — mark it properly." },
  { icon: Sparkles, label: "Appreciate quietly", copy: "The things you notice but rarely say out loud." },
  { icon: Mail, label: "Acknowledge what's hard", copy: "For someone getting through something — let them know you see it." },
];

const STEPS = [
  { icon: Sparkles, title: "Say the thing", copy: "Write it yourself, or let Letterbox help you find the words." },
  { icon: Mic, title: "Add scenes & a voice note", copy: "Photos, quotes, little moments — and your actual voice, if you want." },
  { icon: Music2, title: "Choose an envelope & soundtrack", copy: "Pick a color, a seal, a song. Every detail sets the mood." },
  { icon: Timer, title: "Share the link", copy: "Send it now, or schedule it to unlock at the exact right moment." },
];

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="bg-[#fbf6ef]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-xl text-[#2b2117]">Letterbox</span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 sm:flex">
          <a href="#how-it-works" className="hover:text-[#2b2117]">
            How it works
          </a>
          <a href="#templates" className="hover:text-[#2b2117]">
            Templates
          </a>
          <Link href={user ? "/letters" : "/login"} className="hover:text-[#2b2117]">
            {user ? "My letters" : "Sign in"}
          </Link>
        </nav>
        <Link
          href="/create"
          className="rounded-full bg-[#2b2117] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42352a]"
        >
          Create a letter
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="mb-4 font-hand text-2xl text-[#a8455a]">no login, no fuss — just say it</p>
          <h1 className="font-serif text-4xl leading-[1.1] text-[#2b2117] sm:text-5xl lg:text-6xl">
            Say it like you mean it.
          </h1>
          <p className="mt-6 max-w-md text-lg text-stone-600">
            Letterbox turns a thank-you, a congratulations, or an overdue &ldquo;I see you&rdquo; into a letter someone
            will actually want to open — scenes, a voice note, music, and a moment they can&apos;t skip past.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/create"
              className="rounded-full bg-[#a8455a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8f3a4c]"
            >
              Create a letter — it&apos;s free
            </Link>
            <a href="#how-it-works" className="text-sm font-semibold text-stone-500 hover:text-[#2b2117]">
              See how it works →
            </a>
          </div>
        </div>
        <HeroPreview />
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center font-serif text-3xl text-[#2b2117]">Four steps. No account required.</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf1ee] text-[#a8455a]">
                <s.icon size={18} />
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Step {i + 1}</p>
              <p className="mb-1.5 font-serif text-lg text-[#2b2117]">{s.title}</p>
              <p className="text-sm text-stone-500">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center font-serif text-3xl text-[#2b2117]">For every moment worth marking</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <div key={u.label} className="rounded-2xl bg-[#fbf6ef] p-6">
                <u.icon size={20} className="mb-3 text-[#a8455a]" />
                <p className="mb-1.5 font-serif text-lg text-[#2b2117]">{u.label}</p>
                <p className="text-sm text-stone-500">{u.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center font-serif text-3xl text-[#2b2117]">Choose your envelope</h2>
        <p className="mb-10 text-center text-stone-500">Six colors, six moods — every letter starts with a seal to crack open.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ENVELOPE_TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href="/create"
              className="group rounded-2xl border border-stone-200 p-3 transition hover:border-[#a8455a]"
              style={{ background: t.colors.desk }}
            >
              <div
                className="mb-3 h-16 w-full rounded-lg transition group-hover:scale-105"
                style={{ background: `linear-gradient(155deg, ${t.colors.envPaper}, ${t.colors.envPaper2} 55%, ${t.colors.envPaper3})` }}
              />
              <p className="text-sm font-semibold" style={{ color: t.colors.ink }}>
                {t.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#2b2117] py-20 text-center">
        <p className="mx-auto max-w-lg px-6 font-serif text-3xl text-[#fbf6ef] sm:text-4xl">Nothing left unsaid.</p>
        <Link
          href="/create"
          className="mt-8 inline-block rounded-full bg-[#a8455a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c15266]"
        >
          Create a letter
        </Link>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-stone-400">
        Letterbox — no login, no tracking, just a letter worth opening.
      </footer>
    </div>
  );
}
