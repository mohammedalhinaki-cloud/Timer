import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerStatus, ActiveSessionState } from '../types/timer';
import { requestWakeLock, releaseWakeLock, showSessionCompletionNotification } from '../utils/screen';
import { playGentleFinishChime } from '../utils/sound';
import { logCompletedSession } from '../utils/stats';

const STORAGE_SESSION_KEY = 'tenvylo_active_timer_v1';
const STORAGE_PRESET_KEY = 'tenvylo_last_preset';

export function useStudyTimer() {
  // Preset duration in minutes: default 25 or saved in localStorage
  const [selectedMinutes, setSelectedMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRESET_KEY);
      const num = saved ? Number(saved) : 25;
      return num > 0 && num <= 300 ? num : 25;
    } catch {
      return 25;
    }
  });

  const [mode, setMode] = useState<TimerMode>('countdown');
  const [status, setStatus] = useState<TimerStatus>('idle');

  // Exact milliseconds
  const [currentMs, setCurrentMs] = useState<number>(() => {
    try {
      const savedPreset = localStorage.getItem(STORAGE_PRESET_KEY);
      const num = savedPreset ? Number(savedPreset) : 25;
      const valid = num > 0 && num <= 300 ? num : 25;
      return valid * 60 * 1000;
    } catch {
      return 25 * 60 * 1000;
    }
  });

  const [totalSessionMs, setTotalSessionMs] = useState<number>(() => {
    try {
      const savedPreset = localStorage.getItem(STORAGE_PRESET_KEY);
      const num = savedPreset ? Number(savedPreset) : 25;
      const valid = num > 0 && num <= 300 ? num : 25;
      return valid * 60 * 1000;
    } catch {
      return 25 * 60 * 1000;
    }
  });

  // Internal timestamps and refs
  const startTimeRef = useRef<number>(0);
  const targetEndTimeRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(25 * 60 * 1000);
  const totalDurationRef = useRef<number>(25 * 60 * 1000);
  const modeRef = useRef<TimerMode>('countdown');
  const statusRef = useRef<TimerStatus>('idle');
  const selectedMinutesRef = useRef<number>(25);

  // Synchronize refs
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    selectedMinutesRef.current = selectedMinutes;
  }, [selectedMinutes]);

  // Persist current session state to localStorage
  const persistSession = useCallback((overrideRemainingMs?: number) => {
    if (statusRef.current === 'idle') {
      try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      } catch {
        // ignore
      }
      return;
    }

    const state: ActiveSessionState = {
      mode: modeRef.current,
      targetMinutes: selectedMinutesRef.current,
      totalDurationMs: totalDurationRef.current,
      startTime: startTimeRef.current,
      targetEndTime: targetEndTimeRef.current,
      elapsedBeforePauseMs: elapsedBeforePauseRef.current,
      remainingMs: overrideRemainingMs !== undefined ? overrideRemainingMs : currentMs,
      status: statusRef.current,
      lastUpdated: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not persist session:', err);
    }
  }, [currentMs]);

  // Handle successful session completion
  const handleSessionComplete = useCallback((elapsedSeconds: number, targetMins: number) => {
    setStatus('completed');
    statusRef.current = 'completed';
    releaseWakeLock();

    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }

    // Play pleasant finish chime
    playGentleFinishChime();

    // Browser notification if granted
    showSessionCompletionNotification(
      'أحسنت! انتهت جلسة المذاكرة 🌟',
      `أتممت بنجاح ${targetMins} دقيقة من التركيز الخالص مع تينڤيلو.`
    );

    // Record completed session in statistics
    logCompletedSession({
      durationSeconds: elapsedSeconds,
      mode: 'countdown',
      targetMinutes: targetMins,
      completed: true,
    });
  }, []);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return;
      const saved: ActiveSessionState = JSON.parse(raw);
      if (!saved || !saved.status || saved.status === 'idle') return;

      const now = Date.now();
      const savedMode = saved.mode || 'countdown';
      const targetMins = saved.targetMinutes || 25;
      const totalMs = saved.totalDurationMs || targetMins * 60 * 1000;

      setMode(savedMode);
      modeRef.current = savedMode;
      setSelectedMinutes(targetMins);
      selectedMinutesRef.current = targetMins;
      setTotalSessionMs(totalMs);
      totalDurationRef.current = totalMs;
      startTimeRef.current = saved.startTime || now;
      elapsedBeforePauseRef.current = saved.elapsedBeforePauseMs || 0;

      if (saved.status === 'paused') {
        setStatus('paused');
        statusRef.current = 'paused';
        const rem = saved.remainingMs ?? totalMs;
        pausedRemainingRef.current = rem;
        setCurrentMs(rem);
      } else if (saved.status === 'running') {
        if (savedMode === 'countdown' && saved.targetEndTime) {
          const remaining = saved.targetEndTime - now;
          if (remaining <= 0) {
            // Completed while user was away
            setCurrentMs(0);
            handleSessionComplete(Math.round(totalMs / 1000), targetMins);
          } else {
            targetEndTimeRef.current = saved.targetEndTime;
            setCurrentMs(remaining);
            setStatus('running');
            statusRef.current = 'running';
            requestWakeLock();
          }
        } else if (savedMode === 'stopwatch') {
          const elapsed = (saved.elapsedBeforePauseMs || 0) + (now - saved.startTime);
          setCurrentMs(elapsed);
          setStatus('running');
          statusRef.current = 'running';
          requestWakeLock();
        }
      }
    } catch (err) {
      console.warn('Failed to restore active session:', err);
    }
  }, [handleSessionComplete]);

  // Tick loop based on actual wall-clock Date.now()
  useEffect(() => {
    if (status !== 'running') return;

    let animId: number;

    const tick = () => {
      const now = Date.now();

      if (modeRef.current === 'countdown') {
        const target = targetEndTimeRef.current;
        if (target) {
          const remaining = target - now;
          if (remaining <= 0) {
            setCurrentMs(0);
            handleSessionComplete(
              Math.round(totalDurationRef.current / 1000),
              selectedMinutesRef.current
            );
            return;
          } else {
            setCurrentMs(remaining);
          }
        }
      } else {
        // Stopwatch mode
        const elapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
        setCurrentMs(elapsed);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Also periodic setInterval to keep timer fresh even when tab is throttled
    const syncInterval = setInterval(() => {
      const now = Date.now();
      if (modeRef.current === 'countdown' && targetEndTimeRef.current) {
        const remaining = targetEndTimeRef.current - now;
        if (remaining <= 0) {
          setCurrentMs(0);
          handleSessionComplete(
            Math.round(totalDurationRef.current / 1000),
            selectedMinutesRef.current
          );
        } else {
          setCurrentMs(remaining);
        }
      }
      persistSession();
    }, 2500);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(syncInterval);
    };
  }, [status, handleSessionComplete, persistSession]);

  // Recalculate on tab visibility change to instantly fix any sleep/tab-switching drift
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && statusRef.current === 'running') {
        const now = Date.now();
        if (modeRef.current === 'countdown' && targetEndTimeRef.current) {
          const remaining = targetEndTimeRef.current - now;
          if (remaining <= 0) {
            setCurrentMs(0);
            handleSessionComplete(
              Math.round(totalDurationRef.current / 1000),
              selectedMinutesRef.current
            );
          } else {
            setCurrentMs(remaining);
          }
        } else if (modeRef.current === 'stopwatch') {
          const elapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
          setCurrentMs(elapsed);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleSessionComplete]);

  // Dynamic Browser Tab Title update
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const totalSeconds = Math.max(0, Math.ceil(currentMs / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      const formatted =
        hours > 0
          ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
          : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const prefix = status === 'paused' ? '⏸️ ' : '';
      const modeText = mode === 'countdown' ? 'تركيز' : 'مؤقت تصاعدي';
      document.title = `${prefix}(${formatted}) تينڤيلو — ${modeText}`;
    } else {
      document.title = 'Tenvylo | تينڤيلو — مؤقت المذاكرة والتركيز الفاخر';
    }
  }, [status, currentMs, mode]);

  // Start study action
  const startTimer = useCallback((customMins?: number, newMode: TimerMode = mode) => {
    const targetMode = newMode;
    const now = Date.now();

    setMode(targetMode);
    modeRef.current = targetMode;

    if (targetMode === 'countdown') {
      const mins =
        typeof customMins === 'number' && customMins > 0
          ? customMins
          : selectedMinutesRef.current > 0
          ? selectedMinutesRef.current
          : 25;

      const durationMs = mins * 60 * 1000;

      setSelectedMinutes(mins);
      selectedMinutesRef.current = mins;
      setTotalSessionMs(durationMs);
      totalDurationRef.current = durationMs;
      startTimeRef.current = now;
      elapsedBeforePauseRef.current = 0;
      targetEndTimeRef.current = now + durationMs;
      pausedRemainingRef.current = durationMs;
      setCurrentMs(durationMs);

      try {
        localStorage.setItem(STORAGE_PRESET_KEY, String(mins));
      } catch {
        // ignore
      }
    } else {
      // Stopwatch mode
      targetEndTimeRef.current = null;
      startTimeRef.current = now;
      elapsedBeforePauseRef.current = 0;
      setCurrentMs(0);
      setTotalSessionMs(0);
      totalDurationRef.current = 0;
    }

    setStatus('running');
    statusRef.current = 'running';

    requestWakeLock();

    // Persist immediately
    const targetMins = targetMode === 'countdown' ? selectedMinutesRef.current : 0;
    const durationMs = targetMode === 'countdown' ? totalDurationRef.current : 0;

    const state: ActiveSessionState = {
      mode: targetMode,
      targetMinutes: targetMins,
      totalDurationMs: durationMs,
      startTime: now,
      targetEndTime: targetMode === 'countdown' ? now + durationMs : null,
      elapsedBeforePauseMs: 0,
      remainingMs: targetMode === 'countdown' ? durationMs : 0,
      status: 'running',
      lastUpdated: now,
    };

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [mode]);

  const pauseTimer = useCallback(() => {
    if (statusRef.current !== 'running') return;
    const now = Date.now();

    if (modeRef.current === 'countdown') {
      if (targetEndTimeRef.current) {
        const remaining = Math.max(0, targetEndTimeRef.current - now);
        setCurrentMs(remaining);
        pausedRemainingRef.current = remaining;
      }
    } else {
      elapsedBeforePauseRef.current += now - startTimeRef.current;
      setCurrentMs(elapsedBeforePauseRef.current);
    }

    setStatus('paused');
    statusRef.current = 'paused';
    releaseWakeLock();

    persistSession();
  }, [persistSession]);

  const resumeTimer = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    const now = Date.now();

    startTimeRef.current = now;

    if (modeRef.current === 'countdown') {
      const rem = pausedRemainingRef.current;
      targetEndTimeRef.current = now + rem;
      setCurrentMs(rem);
    }

    setStatus('running');
    statusRef.current = 'running';
    requestWakeLock();

    persistSession();
  }, [persistSession]);

  const togglePauseResume = useCallback(() => {
    if (status === 'running') {
      pauseTimer();
    } else if (status === 'paused') {
      resumeTimer();
    }
  }, [status, pauseTimer, resumeTimer]);

  const endSessionEarly = useCallback((saveStats: boolean = true) => {
    releaseWakeLock();

    let elapsedSec = 0;
    if (modeRef.current === 'countdown') {
      const remainingSec = Math.ceil(currentMs / 1000);
      const totalSec = Math.round(totalDurationRef.current / 1000);
      elapsedSec = Math.max(0, totalSec - remainingSec);
    } else {
      elapsedSec = Math.round(currentMs / 1000);
    }

    // If session was longer than 60 seconds and saveStats requested, log it
    if (saveStats && elapsedSec >= 60) {
      logCompletedSession({
        durationSeconds: elapsedSec,
        mode: modeRef.current,
        targetMinutes: selectedMinutesRef.current,
        completed: false,
      });
    }

    setStatus('idle');
    statusRef.current = 'idle';

    // Reset currentMs to match the selectedMinutes
    const resetMs = selectedMinutesRef.current * 60 * 1000;
    setCurrentMs(resetMs);
    setTotalSessionMs(resetMs);

    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
  }, [currentMs]);

  const resetToIdle = useCallback(() => {
    releaseWakeLock();
    setStatus('idle');
    statusRef.current = 'idle';
    const resetMs = selectedMinutesRef.current * 60 * 1000;
    setCurrentMs(resetMs);
    setTotalSessionMs(resetMs);

    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const changePreset = useCallback((mins: number) => {
    if (status === 'idle') {
      const valid = mins > 0 ? mins : 25;
      const ms = valid * 60 * 1000;
      setSelectedMinutes(valid);
      selectedMinutesRef.current = valid;
      setCurrentMs(ms);
      setTotalSessionMs(ms);
      totalDurationRef.current = ms;

      try {
        localStorage.setItem(STORAGE_PRESET_KEY, String(valid));
      } catch {
        // ignore
      }
    }
  }, [status]);

  return {
    mode,
    setMode,
    status,
    selectedMinutes,
    currentMs,
    totalSessionMs,
    startTimer,
    pauseTimer,
    resumeTimer,
    togglePauseResume,
    endSessionEarly,
    resetToIdle,
    changePreset,
    isFocusActive: status === 'running' || status === 'paused',
  };
}
