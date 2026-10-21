/**
 * Web Audio API finish chime generator for Tenvylo.
 * Zero external audio files required. Completely offline-capable.
 * Plays a calm, elegant notification chime once upon session completion.
 */

let audioCtx: AudioContext | null = null;

/**
 * Pre-warms and unlocks the Web Audio Context on user gesture (e.g. clicking Start Study).
 * This prevents modern browser autoplay policies from blocking the finish chime.
 */
export function warmupAudioContext(): void {
  try {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch (err) {
    console.debug('AudioContext warmup:', err);
  }
}

/**
 * Plays a gentle, peaceful, acoustic finish chime (C-major harmonic chord).
 * Elegant, non-jarring, single occurrence when the timer hits zero.
 */
export function playGentleFinishChime(): void {
  try {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Harmonic triad: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz)
    const notes = [
      { freq: 523.25, gain: 0.14, delay: 0 },
      { freq: 659.25, gain: 0.11, delay: 0.08 },
      { freq: 783.99, gain: 0.09, delay: 0.16 },
    ];

    notes.forEach(({ freq, gain: peakGain, delay }) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      // Smooth attack
      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.linearRampToValueAtTime(peakGain, now + delay + 0.04);
      // Gentle exponential decay over 1.6s
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.6);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.65);
    });
  } catch (err) {
    console.debug('Finish sound playback could not complete:', err);
  }
}
