import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Maximize, Minimize, ShieldAlert } from 'lucide-react';
import { TimerMode, TimerStatus } from '../types/timer';
import { ThemeConfig } from '../types/theme';
import { requestFullscreenSafe, exitFullscreenSafe, isCurrentlyFullscreen } from '../utils/screen';

interface FocusModeProps {
  currentMs: number;
  totalSessionMs: number;
  mode: TimerMode;
  status: TimerStatus;
  targetMinutes: number;
  theme: ThemeConfig;
  onTogglePauseResume: () => void;
  onEndSessionEarly: (saveStats: boolean) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  currentMs,
  status,
  theme,
  onTogglePauseResume,
  onEndSessionEarly,
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inactivity detection: auto-hide floating controls after 3.5 seconds
  const resetInactivityTimer = useCallback(() => {
    if (showConfirmQuit) {
      setControlsVisible(true);
      return;
    }

    setControlsVisible(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      if (!showConfirmQuit) {
        setControlsVisible(false);
      }
    }, 3500);
  }, [showConfirmQuit]);

  // Touch and interaction listeners
  useEffect(() => {
    resetInactivityTimer();

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetInactivityTimer]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePauseResume();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setShowConfirmQuit(true);
        setControlsVisible(true);
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onTogglePauseResume]);

  const toggleFullscreen = async () => {
    if (isCurrentlyFullscreen()) {
      await exitFullscreenSafe();
      setIsFullscreen(false);
    } else {
      const ok = await requestFullscreenSafe();
      setIsFullscreen(ok);
    }
  };

  // Time calculations
  const totalSeconds = Math.max(0, Math.ceil(currentMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedHours = hours > 0 ? `${String(hours).padStart(2, '0')}:` : '';

  return (
    <div
      onClick={resetInactivityTimer}
      className={`fixed inset-0 z-50 w-full h-full flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ${
        theme.bgGradient
      } ${!controlsVisible ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Background Zen Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-20 transition-all duration-1000"
        style={{
          backgroundColor: theme.accentColor,
          transform: status === 'paused' ? 'scale(0.85)' : 'scale(1)',
        }}
      />

      {/* Main Ultra-Clean Timer Display - ONLY the big timer centered with zero clutter */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full text-center">
        {/* Tabular Numerals Display - Perfectly Centered and Scaled */}
        <div
          className={`font-mono tabular-nums font-light tracking-tighter leading-none select-none transition-all duration-300 ${
            theme.timerTextColor
          } ${
            hours > 0
              ? 'text-6xl sm:text-8xl md:text-9xl lg:text-[11rem]'
              : 'text-8xl sm:text-9xl md:text-[12rem] lg:text-[15rem]'
          }`}
          style={{
            textShadow: theme.isLight
              ? 'none'
              : `0 0 90px ${theme.accentGlow}, 0 0 30px ${theme.accentGlow}`,
          }}
        >
          {formattedHours}
          {formattedMinutes}
          <span
            className={`inline-block px-1 sm:px-2 transition-opacity duration-300 ${
              status === 'paused' ? 'opacity-40' : 'opacity-70 animate-pulse'
            }`}
          >
            :
          </span>
          {formattedSeconds}
        </div>
      </div>

      {/* Floating Auto-Hiding Controls (Appears on touch, hover, cursor move or keypress) */}
      <div
        className={`fixed bottom-8 sm:bottom-12 z-20 transition-all duration-500 ease-out ${
          controlsVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <div
          className={`flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full border shadow-2xl backdrop-blur-2xl ${
            theme.isLight
              ? 'bg-white/90 border-slate-300 shadow-slate-200/50'
              : 'bg-[#0f172a]/85 border-white/10 shadow-black/80'
          }`}
        >
          {/* Pause / Resume Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePauseResume();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-md ${
              status === 'running'
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold'
            }`}
            title="إيقاف مؤقت / متابعة (مسافة Space)"
          >
            {status === 'running' ? (
              <>
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>استئناف</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition-colors"
            title="ملء الشاشة (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* End Session Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmQuit(true);
            }}
            className="p-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="إنهاء الجلسة (Esc)"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirm End Early Modal */}
      {showConfirmQuit && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-right ${theme.surfaceBg} ${theme.surfaceBorder}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${theme.timerTextColor}`}>
                إنهاء جلسة المذاكرة؟
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              هل ترغب في إنهاء جلسة التركيز الحالية؟ يمكنك اختيار حفظ الدقائق المنجزة حتى الآن في إحصائياتك أو تجاهلها.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowConfirmQuit(false);
                  onEndSessionEarly(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
              >
                إنهاء وحفظ الدقائق المنجزة
              </button>

              <button
                onClick={() => {
                  setShowConfirmQuit(false);
                  onEndSessionEarly(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-rose-300 text-xs transition"
              >
                إنهاء دون حفظ
              </button>

              <button
                onClick={() => setShowConfirmQuit(false)}
                className="w-full py-2 px-4 rounded-xl hover:bg-white/5 text-slate-400 text-xs transition"
              >
                متابعة المذاكرة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
