#!/usr/bin/env node
// Synthesizes placeholder ambient loops with pure additive/oscillator math —
// no samples, no licensed material, so no licensing question. Mirrors the
// same non-sample synthesis approach used for RealTales' placeholder tracks.
// Clearly a stand-in for real licensed audio before launch, not the real thing.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "music");
const SAMPLE_RATE = 44100;

fs.mkdirSync(OUT_DIR, { recursive: true });

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function osc(type, freq, t) {
  const phase = 2 * Math.PI * freq * t;
  if (type === "sine") return Math.sin(phase);
  if (type === "triangle") return (2 / Math.PI) * Math.asin(Math.sin(phase));
  // soft mix of both, warmer than pure sine, softer than triangle
  return 0.7 * Math.sin(phase) + 0.3 * ((2 / Math.PI) * Math.asin(Math.sin(phase)));
}

function envelope(t, dur, attack, release) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1;
}

/**
 * Renders one looping chord-pad track.
 * @param {{ chords: number[][], chordDur: number, waveform: string, gain: number, arpeggiate?: boolean, delaySec: number, feedback: number }} cfg
 */
function renderTrack(cfg) {
  const { chords, chordDur, waveform, gain, arpeggiate, delaySec, feedback } = cfg;
  const totalDur = chords.length * chordDur;
  const totalSamples = Math.floor(totalDur * SAMPLE_RATE);
  const dry = new Float32Array(totalSamples);

  chords.forEach((chord, chordIdx) => {
    const chordStart = chordIdx * chordDur;
    chord.forEach((freq, noteIdx) => {
      const noteStart = arpeggiate ? chordStart + noteIdx * (chordDur / chord.length) * 0.5 : chordStart;
      const noteDur = arpeggiate ? chordDur * 0.9 : chordDur * 1.05;
      const startSample = Math.floor(noteStart * SAMPLE_RATE);
      const endSample = Math.min(totalSamples, Math.floor((noteStart + noteDur) * SAMPLE_RATE));
      const noteGain = gain / Math.sqrt(chord.length);
      for (let i = startSample; i < endSample; i++) {
        const t = (i - startSample) / SAMPLE_RATE;
        const env = envelope(t, noteDur, noteDur * 0.25, noteDur * 0.55);
        // fundamental + a soft octave-up harmonic for warmth, like in-color.html's playNote
        const sample = osc(waveform, freq, t) * 0.85 + osc(waveform, freq * 2, t) * 0.15;
        dry[i] += sample * env * noteGain;
      }
    });
  });

  // simple comb-filter "room" delay for a touch of warmth/space
  const delaySamples = Math.floor(delaySec * SAMPLE_RATE);
  const wet = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const delayed = i - delaySamples >= 0 ? wet[i - delaySamples] * feedback : 0;
    wet[i] = dry[i] + delayed;
  }

  // fade in/out so the loop point isn't a hard click
  const fadeSamples = Math.floor(0.6 * SAMPLE_RATE);
  for (let i = 0; i < fadeSamples; i++) {
    wet[i] *= i / fadeSamples;
    wet[totalSamples - 1 - i] *= i / fadeSamples;
  }

  // normalize to a sensible peak
  let peak = 0;
  for (let i = 0; i < totalSamples; i++) peak = Math.max(peak, Math.abs(wet[i]));
  const norm = peak > 0 ? 0.55 / peak : 1;
  for (let i = 0; i < totalSamples; i++) wet[i] *= norm;

  return wet;
}

// Note-name-labeled chord voicings (root, third, fifth, octave-up) — equal
// temperament, standard concert pitch. Kept as named constants (not derived
// symbolically) so each track's harmony is easy to eyeball and reuse.
const D = [293.66, 369.99, 440.0, 587.33]; // D major
const A = [220.0, 277.18, 329.63, 440.0]; // A major
const Bm = [246.94, 293.66, 369.99, 493.88]; // B minor
const G = [196.0, 246.94, 293.66, 392.0]; // G major
const C = [261.63, 329.63, 392.0, 523.25]; // C major
const Emin = [164.81, 196.0, 246.94, 329.63]; // E minor
const F = [174.61, 220.0, 261.63, 349.23]; // F major
const Am = [220.0, 261.63, 329.63, 440.0]; // A minor
const Dm = [293.66, 349.23, 440.0, 587.33]; // D minor
const Bb = [233.08, 293.66, 349.23, 466.16]; // Bb major
const Gm = [196.0, 233.08, 293.66, 392.0]; // G minor
const FSm = [185.0, 220.0, 277.18, 369.99]; // F# minor
const E = [329.63, 415.3, 493.88, 659.25]; // E major
const low = (chord) => chord.map((f) => f / 2);

const TRACKS = [
  { file: "first-light", chords: [D, A, Bm, G], chordDur: 4.2, waveform: "sine", gain: 1.0, delaySec: 0.28, feedback: 0.3 },
  { file: "paper-airplanes", chords: [C, G, Am, F], chordDur: 1.7, waveform: "triangle", gain: 0.85, delaySec: 0.12, feedback: 0.15, arpeggiate: true },
  { file: "thank-you-truly", chords: [G, D, Emin, C], chordDur: 5.0, waveform: "mix", gain: 0.95, delaySec: 0.4, feedback: 0.35 },
  { file: "confetti-sky", chords: [C, F, G, Am], chordDur: 1.4, waveform: "triangle", gain: 0.9, delaySec: 0.1, feedback: 0.12, arpeggiate: true },
  { file: "held-close", chords: [FSm, D, A, Bm], chordDur: 6.2, waveform: "sine", gain: 1.05, delaySec: 0.5, feedback: 0.42 },
  { file: "morning-windows", chords: [G, D, C, G], chordDur: 2.8, waveform: "triangle", gain: 0.95, delaySec: 0.2, feedback: 0.22, arpeggiate: true },
  { file: "quiet-company", chords: [low(D), low(Bm), low(G), low(A)], chordDur: 7.0, waveform: "sine", gain: 1.0, delaySec: 0.55, feedback: 0.45 },
  { file: "homecoming", chords: [F, Dm, Bb, C], chordDur: 4.6, waveform: "mix", gain: 1.0, delaySec: 0.35, feedback: 0.32 },
  { file: "open-road", chords: [A, E, FSm, D], chordDur: 2.2, waveform: "triangle", gain: 0.9, delaySec: 0.16, feedback: 0.18, arpeggiate: true },
  { file: "still-water", chords: [low(G), low(Emin), low(C), low(D)], chordDur: 7.5, waveform: "sine", gain: 0.9, delaySec: 0.6, feedback: 0.48 },
  { file: "new-chapter", chords: [F, C, G, Am], chordDur: 4.0, waveform: "sine", gain: 1.0, delaySec: 0.3, feedback: 0.28 },
  { file: "well-earned", chords: [C, G, F, C], chordDur: 2.0, waveform: "mix", gain: 1.1, delaySec: 0.2, feedback: 0.2, arpeggiate: true },
  { file: "fireside", chords: [F, Dm, Gm, C], chordDur: 5.5, waveform: "sine", gain: 1.0, delaySec: 0.42, feedback: 0.36 },
  { file: "one-more-chapter", chords: [low(Bm), low(G), low(FSm), low(Emin)], chordDur: 6.0, waveform: "mix", gain: 0.95, delaySec: 0.48, feedback: 0.4 },
];

// Wipe any previously generated tracks so stale files never linger after a
// library rewrite (id changes would otherwise leave orphaned .wav files).
for (const existing of fs.readdirSync(OUT_DIR)) {
  if (existing.endsWith(".wav")) fs.unlinkSync(path.join(OUT_DIR, existing));
}

for (const t of TRACKS) {
  const samples = renderTrack(t);
  const outPath = path.join(OUT_DIR, `${t.file}.wav`);
  writeWav(outPath, samples);
  console.log(`wrote ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
