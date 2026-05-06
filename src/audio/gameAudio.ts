// Web Audio API sound engine — no dependencies, no CDN, works offline
// All sounds synthesized from scratch using oscillators + noise.

export type SoundKey =
  | 'dice'
  | 'collect'
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'card'
  | 'jail'
  | 'bankrupt'
  | 'win';

// ── Primitive builders ─────────────────────────────────────────────────────

function tone(
  ac: AudioContext,
  freq: number,
  type: OscillatorType,
  startOffset: number,
  duration: number,
  peakGain: number,
) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  const t0  = ac.currentTime + startOffset;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(peakGain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noise(ac: AudioContext, duration: number, gain: number, decayRate = 0.25) {
  const len    = Math.ceil(ac.sampleRate * duration);
  const buf    = ac.createBuffer(1, len, ac.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * decayRate));
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(ac.destination);
  src.start(ac.currentTime);
}

function sweep(
  ac: AudioContext,
  freqStart: number,
  freqEnd: number,
  type: OscillatorType,
  duration: number,
  gain: number,
) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  const t0  = ac.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t0);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// ── Sound definitions ──────────────────────────────────────────────────────

const SOUNDS: Record<SoundKey, (ac: AudioContext) => void> = {

  dice: (ac) => {
    // White-noise rattle with a brief pitch hit
    noise(ac, 0.35, 0.4, 0.18);
    tone(ac, 220, 'triangle', 0,    0.12, 0.25);
    tone(ac, 160, 'triangle', 0.12, 0.12, 0.2);
  },

  collect: (ac) => {
    // Bright ascending C-E-G arpeggio
    const notes = [523, 659, 784];
    notes.forEach((f, i) => tone(ac, f, 'sine', i * 0.08, 0.28, 0.28));
    // Sparkle overtone on the last note
    tone(ac, 1568, 'sine', 0.16, 0.15, 0.1);
  },

  buy: (ac) => {
    // Satisfying "ka-ching" — click + two descending tones
    tone(ac, 1200, 'sine',     0,    0.04, 0.5);
    tone(ac, 880,  'sine',     0.04, 0.25, 0.35);
    tone(ac, 660,  'triangle', 0.12, 0.4,  0.25);
    noise(ac, 0.06, 0.3, 0.5);
  },

  upgrade: (ac) => {
    // 4-note rising sparkle arpeggio
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(ac, f, 'sine', i * 0.07, 0.22, 0.26 - i * 0.02),
    );
    tone(ac, 2093, 'sine', 0.28, 0.18, 0.12);
  },

  rent: (ac) => {
    // Dull descending thud — money leaving
    tone(ac, 330, 'triangle', 0,    0.18, 0.3);
    tone(ac, 220, 'triangle', 0.1,  0.2,  0.25);
    tone(ac, 150, 'sine',     0.2,  0.3,  0.2);
    noise(ac, 0.08, 0.15, 0.4);
  },

  card: (ac) => {
    // Card-flip swoosh: sawtooth sweep down + brief noise
    sweep(ac, 900, 280, 'sawtooth', 0.25, 0.18);
    noise(ac, 0.1, 0.12, 0.6);
    tone(ac, 440, 'sine', 0.12, 0.2, 0.12);
  },

  jail: (ac) => {
    // Heavy low "clang" — bars slamming
    tone(ac, 90,  'sine',     0,    0.7,  0.55);
    tone(ac, 180, 'sawtooth', 0,    0.15, 0.3);
    tone(ac, 55,  'sine',     0.05, 0.8,  0.4);
    noise(ac, 0.18, 0.45, 0.35);
  },

  bankrupt: (ac) => {
    // Sad slow glissando down
    sweep(ac, 420, 110, 'sawtooth', 1.6, 0.25);
    sweep(ac, 210, 55,  'sine',     1.6, 0.2);
    // Three descending stabs for drama
    [400, 300, 200].forEach((f, i) =>
      tone(ac, f, 'triangle', i * 0.18, 0.25, 0.18),
    );
  },

  win: (ac) => {
    // Victory fanfare — 5-note brass-ish ascending phrase
    const melody  = [523, 659, 784, 659, 1047];
    const lengths = [0.14, 0.14, 0.14, 0.1,  0.5];
    let t = 0;
    melody.forEach((f, i) => {
      tone(ac, f,     'sine',     t, lengths[i] * 1.6, 0.32);
      tone(ac, f / 2, 'triangle', t, lengths[i] * 1.6, 0.15);
      t += lengths[i];
    });
    // Final chord bloom
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(ac, f, 'sine', t - 0.05, 0.7, 0.18 - i * 0.02),
    );
  },
};

// ── Singleton audio engine ─────────────────────────────────────────────────

class GameAudioEngine {
  private ac:     AudioContext | null = null;
  private muted:  boolean = false;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ac || this.ac.state === 'closed') {
        const AC = window.AudioContext ?? (window as any).webkitAudioContext;
        if (!AC) return null;
        this.ac = new AC();
      }
      if (this.ac.state === 'suspended') {
        void this.ac.resume();
      }
      return this.ac;
    } catch {
      return null;
    }
  }

  play(key: SoundKey) {
    if (this.muted) return;
    const ac = this.getCtx();
    if (!ac) return;
    try { SOUNDS[key](ac); } catch { /* silent */ }
  }

  setMuted(v: boolean) { this.muted = v; }
  isMuted()            { return this.muted; }

  // Call from any user-gesture handler to unlock iOS Safari
  unlock() { this.getCtx(); }
}

export const gameAudio = new GameAudioEngine();
