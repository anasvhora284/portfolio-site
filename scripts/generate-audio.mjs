#!/usr/bin/env node
/**
 * Procedural audio generator for the portfolio.
 *
 * Writes 16-bit mono PCM WAVs to public/audio/. Every clip is fully
 * synthesised from sines + soft filtered noise, so there are no
 * third-party samples and no licensing concerns.
 *
 * Aesthetic: warm, calm, mood-lifting. Major-key chord voicings (C maj
 * family), bell-like partials, consonant intervals. No heavy sub-bass,
 * no mechanical servo/hiss textures — the whole palette should feel
 * like "a gentle humming cosmos" rather than a shuttle engine room.
 *
 * Output:
 *   - ambient.wav     — 16s seamless pad + sparse bell melody loop.
 *   - warp.wav        — ~0.9s airy glide + bell arpeggio.
 *   - ping.wav        — ~0.35s bright bell confirm.
 *   - click.wav       — ~0.22s glassy high tick.
 *   - door-open.wav   — ~1.4s ascending bell arpeggio with gentle air.
 *   - door-close.wav  — ~1.1s descending bell arpeggio with resolution.
 *   - boot.wav        — ~2.0s uplifting rising arpeggio + chord bloom.
 *   - black-hole.wav  — ~3.0s gentle "stardive" glide into bell chord.
 *
 * Run:  npm run audio:build
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "audio");

/* ------------------------------------------------------------------------ */
/*                              Music helpers                                */
/* ------------------------------------------------------------------------ */

/** C major scale pitches (Hz) from C3 upward — every number here is happy. */
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.00,
};

/* ------------------------------------------------------------------------ */
/*                              WAV writer                                  */
/* ------------------------------------------------------------------------ */

function toWav(samples, sampleRate) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);

  buf.write("RIFF", 0);
  buf.writeUInt32LE(fileSize - 8, 4);
  buf.write("WAVE", 8);

  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buf.writeUInt16LE(numChannels * bytesPerSample, 32);
  buf.writeUInt16LE(bytesPerSample * 8, 34);

  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    /** Soft-clip via tanh so peaks never crunch. */
    const s = Math.tanh(samples[i]);
    const v = Math.max(-1, Math.min(1, s));
    buf.writeInt16LE(Math.round(v * 32767), offset);
    offset += 2;
  }
  return buf;
}

/* ------------------------------------------------------------------------ */
/*                              DSP helpers                                 */
/* ------------------------------------------------------------------------ */

function lowpass(samples, cutoff, sampleRate) {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(samples.length);
  let prev = 0;
  for (let i = 0; i < samples.length; i += 1) {
    prev = prev + alpha * (samples[i] - prev);
    out[i] = prev;
  }
  return out;
}

function highpass(samples, cutoff, sampleRate) {
  const lp = lowpass(samples, cutoff, sampleRate);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) out[i] = samples[i] - lp[i];
  return out;
}

function bandpass(samples, lo, hi, sampleRate) {
  return highpass(lowpass(samples, hi, sampleRate), lo, sampleRate);
}

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 0xffffffff) * 2 - 1;
  };
}

function whiteNoise(length, seed = 1) {
  const rng = mulberry32(seed);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) out[i] = rng();
  return out;
}

function applyAR(samples, sampleRate, attackS, releaseS) {
  const n = samples.length;
  const aN = Math.min(n, Math.floor(attackS * sampleRate));
  const rN = Math.min(n, Math.floor(releaseS * sampleRate));
  for (let i = 0; i < aN; i += 1) samples[i] *= i / aN;
  for (let i = 0; i < rN; i += 1) {
    const k = i / rN;
    samples[n - 1 - i] *= k;
  }
}

/**
 * Render a soft bell tone into an existing buffer at a given time.
 * Timbre: fundamental + octave + octave-fifth partials, exponential decay.
 * Slightly slower decays on higher partials for a sweeter, sustained bell.
 *
 * @param {Float32Array} out
 * @param {number} sr sample rate
 * @param {number} atS onset time in seconds
 * @param {number} freq fundamental (Hz)
 * @param {number} amp peak amplitude
 * @param {number} decay exponential decay rate (higher = shorter)
 */
function bell(out, sr, atS, freq, amp, decay = 3.5) {
  const start = Math.floor(atS * sr);
  const maxLen = out.length - start;
  if (maxLen <= 0) return;
  /** Decay until the amplitude drops below ~-60dB relative to peak. */
  const lenS = Math.min(maxLen / sr, Math.log(1000) / decay);
  const len = Math.floor(lenS * sr);
  for (let i = 0; i < len; i += 1) {
    const t = i / sr;
    /** 3 ms soft attack so there's no click. */
    const attack = Math.min(1, t / 0.003);
    const env = attack * Math.exp(-decay * t);
    const s =
      Math.sin(2 * Math.PI * freq * t) +
      0.45 * Math.exp(-decay * 0.8 * t) * Math.sin(2 * Math.PI * freq * 2 * t) +
      0.25 * Math.exp(-decay * 1.1 * t) * Math.sin(2 * Math.PI * freq * 3 * t);
    out[start + i] += amp * env * s * 0.6;
  }
}

/* ------------------------------------------------------------------------ */
/*                Ambient — 16s warm humming pad + bell melody              */
/* ------------------------------------------------------------------------ */

function makeAmbient() {
  const sr = 22050;
  const durationS = 16;
  const n = sr * durationS;
  const out = new Float32Array(n);

  /**
   * C-major-9 pad voicing — the "humming" core of the piece. Each voice
   * sits mid-register (nothing below 130 Hz) so the bed feels warm and
   * weightless instead of heavy. Slow LFOs detune and amplitude-modulate
   * each voice independently so the chord gently breathes.
   */
  const voices = [
    { freq: NOTE.C3, amp: 0.22, detune: 0.02, lfoHz: 0.07, lfoAmt: 0.30 },
    { freq: NOTE.E3, amp: 0.18, detune: 0.03, lfoHz: 0.11, lfoAmt: 0.28 },
    { freq: NOTE.G3, amp: 0.15, detune: 0.02, lfoHz: 0.09, lfoAmt: 0.32 },
    { freq: NOTE.C4, amp: 0.12, detune: 0.03, lfoHz: 0.13, lfoAmt: 0.38 },
    /** The added 9th (D4) opens the chord up and lifts the mood. */
    { freq: NOTE.D4, amp: 0.07, detune: 0.04, lfoHz: 0.17, lfoAmt: 0.45 },
    /** Faint E5 on top adds sparkle without getting shrill. */
    { freq: NOTE.E5, amp: 0.035, detune: 0.02, lfoHz: 0.19, lfoAmt: 0.55 },
  ];

  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    let s = 0;
    for (const v of voices) {
      const lfo = Math.sin(2 * Math.PI * v.lfoHz * t);
      const amp = v.amp * (1 - v.lfoAmt * 0.5 + v.lfoAmt * 0.5 * lfo);
      s += amp * Math.sin(2 * Math.PI * (v.freq + v.detune * lfo) * t);
    }
    out[i] = s;
  }

  /**
   * Sparse bell-melody layer — the actual "hum". Four soft bell notes
   * tracing C-E-G-E in the 4th/5th octave, played gently across the loop.
   * Each bell peaks at ~0.045 so it never dominates the pad.
   */
  const melody = [
    { at: 1.8,  note: NOTE.G5, amp: 0.045 },
    { at: 4.6,  note: NOTE.C6, amp: 0.040 },
    { at: 7.8,  note: NOTE.E5, amp: 0.045 },
    { at: 10.8, note: NOTE.G5, amp: 0.042 },
    { at: 13.4, note: NOTE.E6, amp: 0.035 },
  ];
  for (const m of melody) bell(out, sr, m.at, m.note, m.amp, 0.9);

  /**
   * Gentle airy shimmer — very faint bandpassed noise up top that swells
   * slowly. This is the only noise layer and it's mixed very low so the
   * bed stays musical, not hissy.
   */
  const shimmer = bandpass(whiteNoise(n, 42), 3000, 7000, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const g = 0.025 * (0.55 + 0.45 * Math.sin(2 * Math.PI * 0.08 * t));
    out[i] += shimmer[i] * g;
  }

  /** Crossfade the tail into the head for seamless looping. */
  const fadeLen = Math.floor(sr * 1.5);
  for (let i = 0; i < fadeLen; i += 1) {
    const k = i / fadeLen;
    const tail = out[n - fadeLen + i];
    const head = out[i];
    out[n - fadeLen + i] = tail * (1 - k) + head * k;
  }

  /** Short fade-in. */
  const fadeIn = Math.floor(sr * 0.5);
  for (let i = 0; i < fadeIn; i += 1) out[i] *= i / fadeIn;

  /** Master gain — generous room to breathe without clipping. */
  for (let i = 0; i < n; i += 1) out[i] *= 0.88;

  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*                        Warp — 0.9s airy glide                             */
/* ------------------------------------------------------------------------ */

function makeWarp() {
  const sr = 44100;
  const durationS = 0.9;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /**
   * Bright airy whoosh — bandpass noise well above the bass range so the
   * transition feels light. Quick swell in, gentle tail out.
   */
  const noise = bandpass(whiteNoise(n, 11), 1800, 6500, sr);
  for (let i = 0; i < n; i += 1) {
    const u = i / n;
    let env;
    if (u < 0.15) env = u / 0.15;
    else env = Math.max(0, 1 - (u - 0.15) / 0.85);
    out[i] += 0.28 * env * noise[i];
  }

  /**
   * Rising arpeggio that lands on a sparkle — C5 → E5 → G5 staggered
   * every 80ms, so the warp has a tiny melodic upswing rather than a
   * heavy whoosh.
   */
  bell(out, sr, 0.02, NOTE.C5, 0.28, 6);
  bell(out, sr, 0.10, NOTE.E5, 0.26, 6);
  bell(out, sr, 0.18, NOTE.G5, 0.30, 5);
  /** Landing sparkle up top. */
  bell(out, sr, 0.32, NOTE.C6, 0.22, 4);
  bell(out, sr, 0.32, NOTE.E6, 0.14, 5);

  /** Master tail. */
  applyAR(out, sr, 0.005, 0.12);

  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*                       Ping — 0.35s bright confirm                         */
/* ------------------------------------------------------------------------ */

function makePing() {
  const sr = 44100;
  const durationS = 0.4;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /** Major-triad chime: C6 + E6 + G6. Short-but-sustained. */
  bell(out, sr, 0.00, NOTE.C6, 0.42, 6);
  bell(out, sr, 0.00, NOTE.E6, 0.28, 7);
  bell(out, sr, 0.00, NOTE.G6, 0.20, 8);

  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*                    Click — 0.22s glassy high tick                         */
/* ------------------------------------------------------------------------ */

function makeClick() {
  const sr = 44100;
  const durationS = 0.22;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /**
   * Glassy tick — a short bell centred at A6 (1760 Hz) with a quick
   * decay. No low-body component so the click feels weightless. A tiny
   * high-noise tap is layered in for tactility.
   */
  bell(out, sr, 0, NOTE.A6, 0.5, 22);
  bell(out, sr, 0, NOTE.E6, 0.22, 28);

  /** Subtle highpassed noise "tap" — 2 ms attack, 10 ms decay. */
  const tap = highpass(whiteNoise(n, 17), 4000, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const env = Math.min(1, t / 0.0015) * Math.exp(-90 * t);
    out[i] += 0.25 * env * tap[i];
  }

  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*              Door open — 1.4s ascending bell arpeggio                     */
/* ------------------------------------------------------------------------ */

function makeDoorOpen() {
  const sr = 44100;
  const durationS = 1.4;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /**
   * Ascending C-major arpeggio — C5 → E5 → G5 → C6 spaced 180 ms apart.
   * Each bell sustains so by the end all four pitches are ringing
   * together as a C-major chord.
   */
  bell(out, sr, 0.00, NOTE.C5, 0.36, 2.4);
  bell(out, sr, 0.18, NOTE.E5, 0.34, 2.3);
  bell(out, sr, 0.36, NOTE.G5, 0.32, 2.2);
  bell(out, sr, 0.55, NOTE.C6, 0.30, 2.1);
  /** Final sparkle for the "threshold crossed" moment. */
  bell(out, sr, 0.82, NOTE.E6, 0.20, 3);
  bell(out, sr, 0.82, NOTE.G6, 0.14, 3);

  /**
   * Very gentle air-sweep underneath — bandpass noise rising then falling,
   * so the transition has a soft "whoosh" of cool air without any hiss.
   */
  const air = bandpass(whiteNoise(n, 33), 1500, 4500, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    let env;
    if (t < 0.4) env = 0.55 * (t / 0.4);
    else env = Math.max(0, 0.55 * (1 - (t - 0.4) / 0.9));
    out[i] += 0.18 * env * air[i];
  }

  applyAR(out, sr, 0.01, 0.2);
  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*              Door close — 1.1s descending bell arpeggio                   */
/* ------------------------------------------------------------------------ */

function makeDoorClose() {
  const sr = 44100;
  const durationS = 1.1;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /** Descending G-E-C arpeggio, resolving gently to a low C. */
  bell(out, sr, 0.00, NOTE.G5, 0.34, 2.5);
  bell(out, sr, 0.18, NOTE.E5, 0.32, 2.5);
  bell(out, sr, 0.36, NOTE.C5, 0.34, 2.2);
  /** Soft resolution — low C octave. */
  bell(out, sr, 0.55, NOTE.C4, 0.26, 2.0);

  /** Gentle closing-air sweep. */
  const air = bandpass(whiteNoise(n, 55), 1200, 4000, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    let env;
    if (t < 0.25) env = 0.55 * (t / 0.25);
    else env = Math.max(0, 0.55 * (1 - (t - 0.25) / 0.75));
    out[i] += 0.16 * env * air[i];
  }

  applyAR(out, sr, 0.01, 0.18);
  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*                Boot — 2.0s uplifting rising arpeggio                      */
/* ------------------------------------------------------------------------ */

function makeBoot() {
  const sr = 44100;
  const durationS = 2.0;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /**
   * Cheerful C-major arpeggio climbing two full octaves: C4-E4-G4-C5-E5-G5-C6.
   * Each bell is pitched further up, with the peak landing around t=1.1s.
   */
  const rise = [
    { at: 0.00, note: NOTE.C4, amp: 0.32, decay: 3.0 },
    { at: 0.15, note: NOTE.E4, amp: 0.32, decay: 3.0 },
    { at: 0.30, note: NOTE.G4, amp: 0.34, decay: 2.8 },
    { at: 0.45, note: NOTE.C5, amp: 0.36, decay: 2.6 },
    { at: 0.60, note: NOTE.E5, amp: 0.36, decay: 2.4 },
    { at: 0.75, note: NOTE.G5, amp: 0.38, decay: 2.2 },
    { at: 0.90, note: NOTE.C6, amp: 0.42, decay: 2.0 },
  ];
  for (const r of rise) bell(out, sr, r.at, r.note, r.amp, r.decay);

  /** Settling bloom — sustained C major triad (C5, E5, G5) for the tail. */
  bell(out, sr, 1.15, NOTE.C5, 0.22, 1.4);
  bell(out, sr, 1.15, NOTE.E5, 0.20, 1.4);
  bell(out, sr, 1.15, NOTE.G5, 0.18, 1.4);
  /** Final high sparkle. */
  bell(out, sr, 1.40, NOTE.E6, 0.18, 2.2);
  bell(out, sr, 1.40, NOTE.G6, 0.12, 2.4);

  /** Faint airy wash underneath the whole thing. */
  const air = bandpass(whiteNoise(n, 77), 2000, 6000, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const env =
      Math.min(1, t / 0.4) * Math.max(0, 1 - Math.max(0, t - 1.4) / 0.6);
    out[i] += 0.11 * env * air[i];
  }

  applyAR(out, sr, 0.01, 0.3);
  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*          Black-hole — 3.0s gentle "stardive" descending chime             */
/* ------------------------------------------------------------------------ */

function makeBlackHole() {
  const sr = 44100;
  const durationS = 3.0;
  const n = Math.floor(sr * durationS);
  const out = new Float32Array(n);

  /**
   * Peaceful descending C-major arpeggio — like floating gently
   * downward through stars instead of being pulled into a singularity.
   * C6 → G5 → E5 → C5 → G4, each sustained so by the end everything
   * rings together as a deep C-major cloud.
   */
  bell(out, sr, 0.00, NOTE.C6, 0.35, 1.3);
  bell(out, sr, 0.35, NOTE.G5, 0.35, 1.3);
  bell(out, sr, 0.70, NOTE.E5, 0.38, 1.2);
  bell(out, sr, 1.05, NOTE.C5, 0.40, 1.1);
  bell(out, sr, 1.45, NOTE.G4, 0.42, 1.0);

  /** Final resolving chord — C3, G3, C4 — peaceful bass bloom. */
  bell(out, sr, 1.90, NOTE.C3, 0.28, 0.8);
  bell(out, sr, 1.90, NOTE.G3, 0.24, 0.9);
  bell(out, sr, 1.90, NOTE.C4, 0.28, 0.85);
  bell(out, sr, 2.00, NOTE.E4, 0.20, 1.0);

  /**
   * Gentle airy wash the whole way through — warm bandpass noise that
   * slowly narrows toward the middle of the spectrum, giving a "wind
   * gently carrying you" feel with no rumble.
   */
  const air = bandpass(whiteNoise(n, 99), 1200, 5000, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const env =
      Math.min(1, t / 0.5) * Math.max(0, 1 - Math.max(0, t - 2.2) / 0.8);
    out[i] += 0.15 * env * air[i];
  }

  /** High faint shimmer for stars twinkling past. */
  const shimmer = bandpass(whiteNoise(n, 121), 3500, 7500, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const env = Math.min(1, t / 0.4) * Math.max(0, 1 - t / 2.8);
    out[i] += 0.055 * env * shimmer[i];
  }

  applyAR(out, sr, 0.02, 0.4);
  return toWav(out, sr);
}

/* ------------------------------------------------------------------------ */
/*                                Main                                      */
/* ------------------------------------------------------------------------ */

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const jobs = [
    { name: "ambient.wav",    build: makeAmbient },
    { name: "warp.wav",       build: makeWarp },
    { name: "ping.wav",       build: makePing },
    { name: "click.wav",      build: makeClick },
    { name: "door-open.wav",  build: makeDoorOpen },
    { name: "door-close.wav", build: makeDoorClose },
    { name: "boot.wav",       build: makeBoot },
    { name: "black-hole.wav", build: makeBlackHole },
  ];

  for (const job of jobs) {
    const wav = job.build();
    const path = resolve(OUT_DIR, job.name);
    await writeFile(path, wav);
    const kb = (wav.length / 1024).toFixed(1);
    process.stdout.write(`[audio] wrote ${job.name} — ${kb} KB\n`);
  }

  process.stdout.write(`[audio] done → ${OUT_DIR}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
