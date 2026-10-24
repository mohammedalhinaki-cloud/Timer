export type TimerMode = 'countdown' | 'stopwatch';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface ActiveSessionState {
  sessionId?: string; // Added compatibly: restored older sessions still work
  mode: TimerMode;
  targetMinutes: number;         // e.g. 25
  totalDurationMs: number;       // e.g. 25 * 60 * 1000
  startTime: number;             // Timestamp when current run started
  targetEndTime: number | null;  // Timestamp when countdown ends (null for stopwatch)
  elapsedBeforePauseMs: number;  // Accumulated elapsed time before pause
  remainingMs: number;           // Remaining milliseconds for countdown
  status: TimerStatus;
  lastUpdated: number;           // Timestamp of last state save
}
