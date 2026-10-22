/**
 * Shpoko sound effects, synthesised with the Web Audio API (no audio files).
 *
 * Every sound is built from "bell" voices: a sine fundamental plus a couple of
 * quickly-decaying overtones, run through a soft compressor and a short
 * generated room reverb. That gives the round, glassy, toy-like feel of a
 * game rather than plain beeps.
 */

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let reverbSend: GainNode | null = null;

const NOTE = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);
// Handy pitches (A4 = 0)
const C5 = NOTE(3), D5 = NOTE(5), E5 = NOTE(7), G5 = NOTE(10), A5 = NOTE(12);
const C6 = NOTE(15), D6 = NOTE(17), E6 = NOTE(19), G6 = NOTE(22), A6 = NOTE(24), C7 = NOTE(27);

function audio(): Ctx | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      compressor.connect(ctx.destination);

      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(compressor);

      // Small, bright room: decaying stereo noise as an impulse response.
      const convolver = ctx.createConvolver();
      const seconds = 1.1;
      const length = Math.floor(ctx.sampleRate * seconds);
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
        }
      }
      convolver.buffer = impulse;
      reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.22;
      reverbSend.connect(convolver);
      convolver.connect(master);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Connects a node to the dry bus and the reverb. */
function toBus(node: AudioNode, wet = 1) {
  node.connect(master!);
  if (wet > 0) {
    const send = ctx!.createGain();
    send.gain.value = wet;
    node.connect(send);
    send.connect(reverbSend!);
  }
}

/** One decaying oscillator. */
function partial(
  type: OscillatorType,
  freq: number,
  start: number,
  peak: number,
  decay: number,
  dest: AudioNode,
  glideTo?: number
) {
  const c = ctx!;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + decay * 0.6);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + decay + 0.05);
}

/** A glassy bell / marimba-like note. */
function bell(freq: number, at: number, { vol = 0.22, decay = 0.55, bright = 1, wet = 1 } = {}) {
  const c = ctx!;
  const voice = c.createGain();
  voice.gain.value = vol;
  toBus(voice, wet);
  partial("sine", freq, at, 1, decay, voice);
  partial("triangle", freq * 2.005, at, 0.28 * bright, decay * 0.45, voice);
  partial("sine", freq * 3.99, at, 0.12 * bright, decay * 0.22, voice);
  partial("sine", freq * 0.5, at, 0.18, decay * 0.7, voice); // warmth
}

/** A short filtered noise burst, for clicks, pops and whooshes. */
function noise(at: number, { dur = 0.04, vol = 0.15, freq = 2500, q = 1.2, sweepTo }: { dur?: number; vol?: number; freq?: number; q?: number; sweepTo?: number } = {}) {
  const c = ctx!;
  const length = Math.max(1, Math.floor(c.sampleRate * dur));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq, at);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, dur / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter);
  filter.connect(gain);
  toBus(gain, 0.3);
  src.start(at);
  src.stop(at + dur + 0.02);
}

const now = () => ctx!.currentTime + 0.005;

export const sfx = {
  /** A blade swish through fruit: a fast airy sweep with a wet little pop. */
  slice() {
    if (!audio()) return;
    const t = now();
    noise(t, { dur: 0.13, vol: 0.14, freq: 1400, q: 0.9, sweepTo: 6500 });
    noise(t + 0.05, { dur: 0.07, vol: 0.09, freq: 700, q: 1.4, sweepTo: 300 });
    partial("sine", 520, t + 0.05, 0.12, 0.09, master!, 240);
  },

  /** Selecting an option or tile: a soft wooden "tock". */
  tap() {
    if (!audio()) return;
    const t = now();
    partial("sine", 900, t, 0.3, 0.07, master!, 520);
    noise(t, { dur: 0.025, vol: 0.06, freq: 3200 });
  },

  /** Taking a tile back off the answer line: same tock, a bit lower. */
  untap() {
    if (!audio()) return;
    const t = now();
    partial("sine", 620, t, 0.26, 0.07, master!, 380);
    noise(t, { dur: 0.02, vol: 0.05, freq: 2200 });
  },

  /** Correct answer: a bright rising "ding-ding". Streaks add sparkle on top. */
  correct(streak = 1) {
    if (!audio()) return;
    const t = now();
    const lift = Math.min(Math.max(streak - 1, 0), 4) * 0.5; // up to +2 semitones on a roll
    const k = Math.pow(2, lift / 12);
    bell(E6 * k, t, { vol: 0.2, decay: 0.35 });
    bell(A6 * k, t + 0.085, { vol: 0.24, decay: 0.7 });
    if (streak >= 3) {
      bell(C7 * k, t + 0.17, { vol: 0.12, decay: 0.6, bright: 0.6 });
      noise(t + 0.17, { dur: 0.25, vol: 0.03, freq: 7000, q: 0.8, sweepTo: 11000 });
    }
  },

  /** Wrong answer: a soft, friendly "bwomp" rather than a harsh buzzer. */
  wrong() {
    if (!audio()) return;
    const c = ctx!;
    const t = now();
    const voice = c.createGain();
    voice.gain.value = 0.2;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(380, t + 0.35);
    voice.connect(filter);
    toBus(filter, 0.5);
    partial("square", NOTE(-7), t, 0.35, 0.18, voice, NOTE(-8)); // D4
    partial("square", NOTE(-12), t + 0.13, 0.4, 0.32, voice, NOTE(-14)); // A3 bending down
    partial("sine", NOTE(-24), t + 0.13, 0.5, 0.3, voice); // body
  },

  /** A correct pair in a matching exercise: pops climb a pentatonic scale. */
  match(index: number) {
    if (!audio()) return;
    const t = now();
    const scale = [C5, D5, E5, G5, A5, C6, D6, E6, G6];
    const f = scale[Math.min(index, scale.length - 1)] * 2;
    bell(f, t, { vol: 0.2, decay: 0.4 });
    partial("sine", f * 1.5, t + 0.04, 0.08, 0.2, master!);
    noise(t, { dur: 0.03, vol: 0.05, freq: 5000 });
  },

  /** A wrong pair in a matching exercise: a quick, muted thud. */
  miss() {
    if (!audio()) return;
    const t = now();
    partial("triangle", 220, t, 0.28, 0.16, master!, 150);
    noise(t, { dur: 0.05, vol: 0.06, freq: 600, q: 0.7 });
  },

  /** A new letter card appears: an airy whoosh into a gentle chime. */
  reveal() {
    if (!audio()) return;
    const t = now();
    noise(t, { dur: 0.28, vol: 0.05, freq: 900, q: 0.6, sweepTo: 5200 });
    bell(G5 * 2, t + 0.16, { vol: 0.1, decay: 0.5, bright: 0.5 });
    bell(C6 * 2, t + 0.24, { vol: 0.08, decay: 0.7, bright: 0.4 });
  },

  /** Lesson complete: a rising arpeggio that lands on a shimmering chord. */
  complete() {
    if (!audio()) return;
    const t = now();
    [C5, E5, G5, C6, E6].forEach((f, i) => bell(f * 2, t + i * 0.085, { vol: 0.17, decay: 0.45 }));
    const land = t + 0.5;
    [C6, E6, G6, C7].forEach((f) => bell(f, land, { vol: 0.12, decay: 1.6, bright: 0.7 }));
    bell(C5, land, { vol: 0.18, decay: 1.4, bright: 0.3 });
    // Sparkles
    [0, 0.07, 0.15, 0.24, 0.34].forEach((d, i) =>
      bell(C7 * Math.pow(2, [0, 4, 7, 12, 16][i] / 12), land + 0.1 + d, { vol: 0.05, decay: 0.4, bright: 0.3 })
    );
    noise(land, { dur: 0.6, vol: 0.025, freq: 8000, q: 0.5, sweepTo: 12000 });
  },
};

export type Sfx = typeof sfx;
