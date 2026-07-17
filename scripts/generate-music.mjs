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

const D = [293.66, 369.99, 440.0, 587.33];
const Bm = [246.94, 293.66, 369.99, 493.88];
const G = [196.0, 246.94, 293.66, 392.0];
const A = [220.0, 277.18, 329.63, 440.0];
const Dlow = D.map((f) => f / 2);
const Bmlow = Bm.map((f) => f / 2);
const Glow = G.map((f) => f / 2);
const Alow = A.map((f) => f / 2);
const Emin = [164.81, 196.0, 246.94, 329.63];
const C = [261.63, 329.63, 392.0, 523.25];

const TRACKS = [
  { file: "warm-embrace", chords: [D, Bm, G, A], chordDur: 4.5, waveform: "mix", gain: 1.0, delaySec: 0.32, feedback: 0.32 },
  { file: "sunlit-window", chords: [G, D, Emin, C], chordDur: 3.2, waveform: "triangle", gain: 0.95, delaySec: 0.22, feedback: 0.24, arpeggiate: true },
  { file: "quiet-letter", chords: [Dlow, Bmlow, Glow, Alow], chordDur: 6, waveform: "sine", gain: 1.05, delaySec: 0.45, feedback: 0.42 },
  { file: "golden-hour", chords: [Glow, Emin, C, D.map((f) => f / 2)], chordDur: 5.5, waveform: "sine", gain: 1.0, delaySec: 0.4, feedback: 0.38 },
  { file: "bright-days", chords: [C, G, A, D], chordDur: 2.6, waveform: "triangle", gain: 0.9, delaySec: 0.18, feedback: 0.2, arpeggiate: true },
  { file: "gentle-gratitude", chords: [Bmlow, Glow, Dlow, Emin.map((f) => f / 2)], chordDur: 6.5, waveform: "mix", gain: 0.95, delaySec: 0.5, feedback: 0.35 },
];

for (const t of TRACKS) {
  const samples = renderTrack(t);
  const outPath = path.join(OUT_DIR, `${t.file}.wav`);
  writeWav(outPath, samples);
  console.log(`wrote ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
