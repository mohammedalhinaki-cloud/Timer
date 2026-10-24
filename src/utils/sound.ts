/**
 * Lightweight, self-contained looping bell using the Web Audio API.
 * An AudioBufferSourceNode loops on the audio rendering thread so timer throttling
 * in background tabs cannot introduce gaps or spawn overlapping intervals.
 */
let context: AudioContext | null = null;
let bellSource: AudioBufferSourceNode | null = null;
let bellGain: GainNode | null = null;
let cachedBuffer: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (context && context.state !== 'closed') return context;
  try {
    const AudioClass = window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioClass) return null;
    context = new AudioClass();
    cachedBuffer = null;
    return context;
  } catch {
    return null;
  }
}

/** Unlock audio while handling the initial user interaction. */
export function warmupAudioContext(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
}

/** Generate two softly struck bell notes followed by silence in one repeating buffer. */
function makeBellBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * 2.7);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const samples = buffer.getChannelData(0);
  const harmonics = [1, 2.01, 2.96, 4.07];
  const levels = [0.48, 0.17, 0.095, 0.045];
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let value = 0;
    for (const [strike, root, strength] of [[0, 784, 1], [0.23, 988, 0.72]]) {
      const elapsed = t - strike;
      if (elapsed < 0 || elapsed > 2.15) continue;
      const envelope = (1 - Math.exp(-elapsed * 100)) * Math.exp(-elapsed * 2.7);
      let tone = 0;
      for (let h = 0; h < harmonics.length; h++) {
        tone += Math.sin(2 * Math.PI * root * harmonics[h] * elapsed) * levels[h];
      }
      value += tone * envelope * strength;
    }
    samples[i] = Math.max(-1, Math.min(1, value));
  }
  return buffer;
}

/** Repeat until acknowledged. Safe to call more than once. */
export function startRepeatingFinishBell(): void {
  if (bellSource) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    if (!cachedBuffer) cachedBuffer = makeBellBuffer(ctx);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.8;
    source.buffer = cachedBuffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(ctx.destination);
    bellSource = source;
    bellGain = gain;
    source.start();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  } catch {
    stopRepeatingFinishBell();
  }
}

/** Immediately silence and free active nodes on acknowledgement or unmount. */
export function stopRepeatingFinishBell(): void {
  const source = bellSource;
  const gain = bellGain;
  bellSource = null;
  bellGain = null;
  try { source?.stop(); } catch { /* source may not have started */ }
  try { source?.disconnect(); } catch { /* ignore */ }
  try { gain?.disconnect(); } catch { /* ignore */ }
}
