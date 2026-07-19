#!/usr/bin/env node
// Synthesized placeholder music — no samples, no licensed material, so no
// licensing question (same principle as the first pass). This is a sound
// design rewrite, not just new chords: a single detuned oscillator per note
// read as a thin, harsh "MIDI demo" beep. This version gives each note a
// small chorus of detuned voices plus soft upper harmonics (warmth), runs
// the mix through an actual Schroeder-style reverb (parallel comb filters +
// series allpass, not a single feedback echo), renders true stereo with
// decorrelated L/R reverb for width, and soft-clips instead of hard-clipping.
// Still a placeholder for real licensed audio, just one that shouldn't be
// unpleasant to actually listen to.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "music");
const SAMPLE_RATE = 44100;

fs.mkdirSync(OUT_DIR, { recursive: true });

function writeWavStereo(filePath, left, right) {
  const numSamples = left.length;
  const numChannels = 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    buffer.writeInt16LE(Math.round(softClip(left[i]) * 32767), offset);
    offset += 2;
    buffer.writeInt16LE(Math.round(softClip(right[i]) * 32767), offset);
    offset += 2;
  }
  fs.writeFileSync(filePath, buffer);
}

// Gentle tanh saturation — rounds off peaks musically instead of the harsh
// digital "crack" a hard Math.max/min clip produces if levels run hot.
function softClip(x) {
  return Math.tanh(x * 1.05) * 0.97;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

// Raised-cosine attack/release — a curved swell instead of a linear ramp,
// reads as a real instrument's envelope rather than a volume fade.
function envelope(t, dur, attack, release) {
  if (t < attack) return 0.5 - 0.5 * Math.cos((Math.PI * t) / attack);
  if (t > dur - release) {
    const x = Math.max(0, (dur - t) / release);
    return 0.5 - 0.5 * Math.cos(Math.PI * x);
  }
  return 1;
}

// One note = a 3-voice detuned chorus (the classic trick for turning a thin
// single oscillator into something that sounds like a pad, not a beep) plus
// two soft upper harmonics for a little shimmer/warmth on top.
function noteSample(freq, t) {
  const detune = Math.pow(2, 6 / 1200); // +/-6 cents
  const chorus = (sine(freq, t) + 0.82 * sine(freq * detune, t) + 0.82 * sine(freq / detune, t)) / 2.64;
  const h2 = sine(freq * 2, t) * 0.16;
  const h3 = sine(freq * 3, t) * 0.06;
  return chorus * 0.84 + h2 + h3;
}

/** Renders the dry (mono) note mix for one track — same chord-scheduling
 * logic as before, just calling the richer noteSample instead of a raw
 * oscillator. `tailSec` of silence is appended so the reverb has room to
 * decay naturally instead of being chopped off at the last chord. */
function renderDry(cfg, tailSec) {
  const { chords, chordDur, gain, arpeggiate } = cfg;
  const musicDur = chords.length * chordDur;
  const totalSamples = Math.floor((musicDur + tailSec) * SAMPLE_RATE);
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
        const env = envelope(t, noteDur, noteDur * 0.22, noteDur * 0.6);
        dry[i] += noteSample(freq, t) * env * noteGain;
      }
    });
  });

  // A very slow, subtle amplitude "breathing" so held chords don't sit
  // perfectly static — real sustained tones drift slightly, dead-flat ones
  // read as synthetic even before you can say why.
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    dry[i] *= 1 + 0.035 * Math.sin(2 * Math.PI * 0.09 * t);
  }

  return dry;
}

function combFilter(input, delaySamples, feedback, damp) {
  const out = new Float32Array(input.length);
  const line = new Float32Array(delaySamples);
  let idx = 0;
  let store = 0;
  for (let i = 0; i < input.length; i++) {
    const delayed = line[idx];
    store = delayed * (1 - damp) + store * damp;
    line[idx] = input[i] + store * feedback;
    out[i] = delayed;
    idx = (idx + 1) % delaySamples;
  }
  return out;
}

function allpassFilter(input, delaySamples, feedback) {
  const out = new Float32Array(input.length);
  const line = new Float32Array(delaySamples);
  let idx = 0;
  for (let i = 0; i < input.length; i++) {
    const delayed = line[idx];
    out[i] = -input[i] + delayed;
    line[idx] = input[i] + delayed * feedback;
    idx = (idx + 1) % delaySamples;
  }
  return out;
}

/** A small Schroeder/Freeverb-style reverb — parallel combs (the "body" of
 * the tail) feeding series allpasses (smooths the combs' metallic ringing
 * into something closer to a real room). combDelays differ between the L
 * and R calls so the two channels decorrelate into an actual stereo tail
 * instead of a mono echo panned dead-center. */
function reverb(dry, combDelaysSamples, allpassDelaysSamples, roomSize, damp) {
  let wet = new Float32Array(dry.length);
  for (const d of combDelaysSamples) {
    const c = combFilter(dry, d, roomSize, damp);
    for (let i = 0; i < wet.length; i++) wet[i] += c[i] / combDelaysSamples.length;
  }
  for (const d of allpassDelaysSamples) {
    wet = allpassFilter(wet, d, 0.5);
  }
  return wet;
}

// The classic Freeverb comb/allpass delay constants are tuned in samples
// at 44.1kHz — rescale them if SAMPLE_RATE ever changes from that.
function freeverbSamples(refSamplesAt44100) {
  return Math.round((refSamplesAt44100 / 44100) * SAMPLE_RATE);
}

function renderTrackStereo(cfg) {
  const tailSec = 1.8;
  const dry = renderDry(cfg, tailSec);

  // Same room, decorrelated per channel (classic stereo-reverb trick) —
  // values are the well-worn Freeverb comb/allpass set, offset a few ms for R.
  const combsL = [1557, 1617, 1491, 1422, 1277, 1356].map(freeverbSamples);
  const combsR = [1557 + 23, 1617 + 19, 1491 + 31, 1422 + 17, 1277 + 29, 1356 + 13].map(freeverbSamples);
  const allpasses = [225, 556].map(freeverbSamples);

  const roomSize = 0.72;
  const damp = 0.35;
  const wetL = reverb(dry, combsL, allpasses, roomSize, damp);
  const wetR = reverb(dry, combsR, allpasses, roomSize, damp);

  const dryGain = 0.62;
  const wetGain = 0.55;
  const n = dry.length;
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = dry[i] * dryGain + wetL[i] * wetGain;
    right[i] = dry[i] * dryGain + wetR[i] * wetGain;
  }

  // Fade in/out across the tail so the loop point is silent-to-silent, not
  // a hard edge — the reverb tail decays into that fade instead of getting
  // chopped mid-ring.
  const fadeInSamples = Math.floor(0.6 * SAMPLE_RATE);
  const fadeOutSamples = Math.floor(tailSec * SAMPLE_RATE);
  for (let i = 0; i < fadeInSamples; i++) {
    const g = i / fadeInSamples;
    left[i] *= g;
    right[i] *= g;
  }
  for (let i = 0; i < fadeOutSamples; i++) {
    const g = i / fadeOutSamples;
    const idx = n - 1 - i;
    left[idx] *= g;
    right[idx] *= g;
  }

  // Normalize both channels by the same factor so the stereo balance the
  // reverb decorrelation created is preserved, not independently squashed.
  let peak = 0;
  for (let i = 0; i < n; i++) {
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }
  const norm = peak > 0 ? 0.6 / peak : 1;
  for (let i = 0; i < n; i++) {
    left[i] *= norm;
    right[i] *= norm;
  }

  return { left, right };
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
  { file: "first-light", chords: [D, A, Bm, G], chordDur: 4.2, gain: 1.0 },
  { file: "paper-airplanes", chords: [C, G, Am, F], chordDur: 1.7, gain: 0.85, arpeggiate: true },
  { file: "thank-you-truly", chords: [G, D, Emin, C], chordDur: 5.0, gain: 0.95 },
  { file: "confetti-sky", chords: [C, F, G, Am], chordDur: 1.4, gain: 0.9, arpeggiate: true },
  { file: "held-close", chords: [FSm, D, A, Bm], chordDur: 6.2, gain: 1.05 },
  { file: "morning-windows", chords: [G, D, C, G], chordDur: 2.8, gain: 0.95, arpeggiate: true },
  { file: "quiet-company", chords: [low(D), low(Bm), low(G), low(A)], chordDur: 7.0, gain: 1.0 },
  { file: "homecoming", chords: [F, Dm, Bb, C], chordDur: 4.6, gain: 1.0 },
  { file: "open-road", chords: [A, E, FSm, D], chordDur: 2.2, gain: 0.9, arpeggiate: true },
  { file: "still-water", chords: [low(G), low(Emin), low(C), low(D)], chordDur: 7.5, gain: 0.9 },
  { file: "new-chapter", chords: [F, C, G, Am], chordDur: 4.0, gain: 1.0 },
  { file: "well-earned", chords: [C, G, F, C], chordDur: 2.0, gain: 1.1, arpeggiate: true },
  { file: "fireside", chords: [F, Dm, Gm, C], chordDur: 5.5, gain: 1.0 },
  { file: "one-more-chapter", chords: [low(Bm), low(G), low(FSm), low(Emin)], chordDur: 6.0, gain: 0.95 },
];

// Wipe any previously generated tracks so stale files never linger after a
// library rewrite (id changes would otherwise leave orphaned .wav files).
for (const existing of fs.readdirSync(OUT_DIR)) {
  if (existing.endsWith(".wav")) fs.unlinkSync(path.join(OUT_DIR, existing));
}

for (const t of TRACKS) {
  const { left, right } = renderTrackStereo(t);
  const outPath = path.join(OUT_DIR, `${t.file}.wav`);
  writeWavStereo(outPath, left, right);
  console.log(`wrote ${outPath} (${(left.length / SAMPLE_RATE).toFixed(1)}s, stereo)`);
}
