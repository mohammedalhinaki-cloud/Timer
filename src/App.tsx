import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Palette,
  Share2,
  Play,
  Flame,
  Clock,
  SlidersHorizontal,
  Timer,
  BookOpen,
  ArrowUpLeft,
} from 'lucide-react';
import { THEMES, ThemeId, ThemeConfig } from './types/theme';
import { useStudyTimer } from './hooks/useStudyTimer';
import { calculateStatsSummary, getAllSessions } from './utils/stats';
import { warmupAudioContext, stopRepeatingFinishBell } from './utils/sound';
import { requestFullscreenSafe } from './utils/screen';
import { FocusMode } from './components/FocusMode';
import { StatsView } from './components/StatsView';
import { AdSlot } from './components/AdSlot';
import { ThemeModal } from './components/ThemeModal';
import { CompletionModal } from './components/CompletionModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { AlarmSettingsButton } from './components/AlarmSettingsButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ADS_ENABLED } from './config/ads';

const STORAGE_THEME_KEY = 'tenvylo_theme_id';
const STORAGE_SYSTEM_SYNC_KEY = 'tenvylo_theme_system_sync';

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId;
      return saved && THEMES[saved] ? saved : 'midnight';
    } catch {
      return 'midnight';
    }
  });

  const [isSystemSync, setIsSystemSync] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_SYSTEM_SYNC_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // System dark/light media query listener
  useEffect(() => {
    if (!isSystemSync) return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setThemeId(e.matches ? 'minimal-light' : 'midnight');
    };
    update(media);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [isSystemSync]);

  const handleSelectTheme = (id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // ignore
    }
  };

  const handleToggleSystemSync = (val: boolean) => {
    setIsSystemSync(val);
    try {
      localStorage.setItem(STORAGE_SYSTEM_SYNC_KEY, val ? 'true' : 'false');
      if (val) {
        const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        setThemeId(isLight ? 'minimal-light' : 'midnight');
      }
    } catch {
      // ignore
    }
  };

  const activeTheme: ThemeConfig = useMemo(() => THEMES[themeId] || THEMES.midnight, [themeId]);

  // Modals state
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputMins, setCustomInputMins] = useState(30);
  const [shareStatus, setShareStatus] = useState('');

  const handleShare = async () => {
    const url = window.location.origin + '/';
    const data = { title: 'Tenvylo | تينڤيلو', text: 'مساحة هادئة للمذاكرة والتركيز', url };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else {
        const field = document.createElement('textarea');
        field.value = url; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.append(field); field.select();
        if (!document.execCommand('copy')) throw new Error('Copy not supported');
        field.remove();
      }
      setShareStatus('تم نسخ رابط الموقع');
    } catch { setShareStatus('تعذر نسخ الرابط، يمكنك نسخه من شريط العنوان'); }
    window.setTimeout(() => setShareStatus(''), 2800);
  };

  // Stats state
  const [allSessions, setAllSessions] = useState(() => getAllSessions());
  const [stats, setStats] = useState(() => calculateStatsSummary(allSessions));

  const refreshStats = useCallback(() => {
    const updated = getAllSessions();
    setAllSessions(updated);
    setStats(calculateStatsSummary(updated));
  }, []);

  // Timer engine
  const timer = useStudyTimer();

  // Presets
  const presets = [25, 45, 50, 60];

  // Primary Start Action with Audio Context Pre-warming and Fullscreen attempt
  const handleStartStudy = async () => {
    warmupAudioContext(); // Pre-warm Web Audio API on user gesture for seamless completion chime
    await requestFullscreenSafe();
    timer.startTimer(timer.selectedMinutes, 'countdown');
  };

  const handleStartStopwatch = async () => {
    warmupAudioContext();
    await requestFullscreenSafe();
    timer.startTimer(0, 'stopwatch');
  };

  // Format preview display for main screen
  const previewSeconds = Math.max(0, Math.ceil(timer.currentMs / 1000));
  const previewMins = Math.floor(previewSeconds / 60);
  const previewSecs = previewSeconds % 60;
  const formattedPreview = `${String(previewMins).padStart(2, '0')}:${String(previewSecs).padStart(2, '0')}`;

  // If Focus Mode is active, render FocusMode exclusively with ZERO other distractions
  if (timer.isFocusActive) {
    return (
      <FocusMode
        currentMs={timer.currentMs}
        totalSessionMs={timer.totalSessionMs}
        mode={timer.mode}
        status={timer.status}
        targetMinutes={timer.selectedMinutes}
        theme={activeTheme}
        onTogglePauseResume={() => {
          warmupAudioContext();
          timer.togglePauseResume();
        }}
        onEndSessionEarly={(saveStats) => {
          timer.endSessionEarly(saveStats);
          refreshStats();
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen min-h-[100dvh] flex flex-col transition-colors duration-500 text-slate-100 overflow-x-hidden ${activeTheme.bgGradient}`}
    >
      {/* Background ambient lighting */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[650px] h-[450px] rounded-full blur-[160px] pointer-events-none opacity-25"
        style={{ backgroundColor: activeTheme.accentColor }}
      />

      {/* Top Header - Balanced and streamlined with sound & bell removed */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-2">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
              <Timer className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${activeTheme.timerTextColor}`}>
                  تينڤيلو
                </h1>
                <span className="hidden sm:inline text-[11px] sm:text-xs font-mono font-medium text-slate-400">
                  Tenvylo
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block">
                مؤقت المذاكرة والتركيز الفاخر
              </p>
            </div>
          </div>

          {/* Identical touch targets in a consistent RTL action group. */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2" role="group" aria-label="إجراءات الموقع">
            <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${activeTheme.badgeBg}`}
              title="إحصائية المذاكرة لليوم">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums font-bold">{stats.currentStreakDays}</span>
              <span className="opacity-40">|</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono tabular-nums font-bold">{stats.todayMinutes}</span>
              <span className="text-[10px] opacity-80">د</span>
            </div>
            <button type="button" onClick={() => setShowThemeModal(true)}
              className={`tenvylo-header-action ${activeTheme.isLight ? 'tenvylo-header-action--light' : ''}`}
              title="اختيار ألوان الموقع" aria-label="اختيار ألوان الموقع">
              <Palette size={19} strokeWidth={1.9} aria-hidden="true" />
            </button>
            <AlarmSettingsButton theme={activeTheme} />
            <PWAInstallButton theme={activeTheme} />
            <button type="button" onClick={handleShare}
              className={`tenvylo-header-action ${activeTheme.isLight ? 'tenvylo-header-action--light' : ''}`}
              title="مشاركة الموقع" aria-label="مشاركة الموقع">
              <Share2 size={19} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Optimized mobile vertical spacing */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-3 sm:px-4 pt-2 pb-2 sm:pt-4 sm:pb-4 max-w-5xl mx-auto w-full">
        {/* Welcoming Subtitle */}
        <div className="text-center mb-5 sm:mb-7">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${activeTheme.timerTextColor}`}>
            مساحتك الهادئة للتركيز والإنجاز
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-400 mt-1 sm:mt-2 max-w-md mx-auto">
            اختر مدة جلستك وانغمس في تجربة خالية تماماً من المشتتات
          </p>
        </div>

        {/* Central Timer Card */}
        <div
          className={`w-full max-w-md sm:max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-300 ${activeTheme.surfaceBg} ${activeTheme.surfaceBorder} text-center`}
        >
          {/* Mode Switcher: Countdown vs Stopwatch */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-black/20 border border-white/5 mb-4 sm:mb-6 max-w-xs mx-auto">
            <button
              onClick={() => {
                timer.setMode('countdown');
                timer.changePreset(timer.selectedMinutes || 25);
              }}
              className={`flex-1 py-1 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                timer.mode === 'countdown'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مؤقت محدد (Countdown)
            </button>
            <button
              onClick={() => {
                timer.setMode('stopwatch');
              }}
              className={`flex-1 py-1 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                timer.mode === 'stopwatch'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تصاعدي (Stopwatch)
            </button>
          </div>

          {/* Quick Preset Chips on single neat grid for mobile without overflow */}
          {timer.mode === 'countdown' && (
            <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2 mb-4 sm:mb-6">
              {presets.map((min) => {
                const isSelected = timer.selectedMinutes === min;
                return (
                  <button
                    key={min}
                    onClick={() => timer.changePreset(min)}
                    className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold font-mono tabular-nums transition-all text-center ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                        : activeTheme.isLight
                        ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {min}د
                  </button>
                );
              })}

              {/* Custom Duration Button */}
              <button
                onClick={() => {
                  setCustomInputMins(timer.selectedMinutes);
                  setShowCustomModal(true);
                }}
                className={`py-1.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 transition-all text-center ${
                  !presets.includes(timer.selectedMinutes)
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : activeTheme.isLight
                    ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
                title="تحديد مدة مخصصة"
              >
                <SlidersHorizontal className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>
                  {!presets.includes(timer.selectedMinutes) ? `${timer.selectedMinutes}د` : 'مخصص'}
                </span>
              </button>
            </div>
          )}

          {/* Large Clean Timer Display in Center */}
          <div className="my-2 sm:my-4 select-none">
            <div
              className={`font-mono tabular-nums font-light text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none ${activeTheme.timerTextColor}`}
              style={{
                textShadow: activeTheme.isLight
                  ? 'none'
                  : `0 0 60px ${activeTheme.accentGlow}`,
              }}
            >
              {timer.mode === 'stopwatch' ? '00:00' : formattedPreview}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-2 sm:mt-3 font-medium">
              {timer.mode === 'stopwatch'
                ? 'مؤقت مفتوح يبدأ من الصفر'
                : `مدة الجلسة: ${timer.selectedMinutes} دقيقة`}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="mt-5 sm:mt-7">
            <button
              onClick={timer.mode === 'stopwatch' ? handleStartStopwatch : handleStartStudy}
              className={`w-full group flex items-center justify-center gap-2.5 py-3 sm:py-3.5 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 transform active:scale-[0.98] shadow-xl ${
                activeTheme.accentBg
              }`}
            >
              <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
              <span>ابدأ المذاكرة</span>
            </button>
          </div>

          {/* Quick Note about Focus Mode */}
          <div className="mt-3 text-[10px] sm:text-[11px] text-slate-400/90 leading-tight">
            بمجرد البدء، ستتحول الشاشة إلى وضع التركيز الهادئ ويعرض عداد الوقت فقط.
          </div>
        </div>

        {/* Optional Ad Slot - Completely unrendered when ADS_ENABLED is false */}
        {ADS_ENABLED && (
          <div className="w-full mt-6">
            <AdSlot
              format="adaptive"
              slotId="tenvylo-home-banner"
              isFocusActive={timer.isFocusActive}
              theme={activeTheme}
            />
          </div>
        )}

        {/* Statistics Dashboard */}
        <StatsView
          stats={stats}
          allSessions={allSessions}
          onRefreshStats={refreshStats}
          theme={activeTheme}
        />
      </main>

      {/* Full-width footer pinned by the flex-grow main. */}
      <footer className={'relative z-10 mt-auto w-full shrink-0 border-t px-3 py-3 backdrop-blur-xl transition-colors duration-300 ' +
        (activeTheme.isLight
          ? 'border-cyan-700/15 bg-white/80 text-slate-700'
          : 'border-cyan-300/10 bg-slate-950/55 text-slate-300')}>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
        <div className="relative mx-auto flex max-w-5xl items-center justify-center gap-3 whitespace-nowrap text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Timer className="h-4 w-4 text-cyan-400" strokeWidth={1.8} aria-hidden="true" />
            <span className={activeTheme.timerTextColor}>تينڤيلو</span>
          </span>
          <span className="h-3.5 w-px bg-cyan-400/25" aria-hidden="true" />
          <a href="https://study-tools-f3398d.pages.dev/"
            className={'group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ' +
              (activeTheme.isLight
                ? 'text-cyan-700 hover:bg-cyan-500/10'
                : 'text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100')}>
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            أدوات الدراسة
            <ArrowUpLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </footer>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-right ${activeTheme.surfaceBg} ${activeTheme.surfaceBorder}`}
          >
            <h3 className={`text-base font-bold mb-2 ${activeTheme.timerTextColor}`}>
              تحديد مدة مخصصة للمذاكرة
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              اختر عدد الدقائق المناسب لجلستك (من 1 إلى 180 دقيقة):
            </p>

            <div className="flex items-center justify-center gap-4 my-6">
              <button
                onClick={() => setCustomInputMins((m) => Math.max(1, m - 5))}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-lg flex items-center justify-center"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold font-mono text-cyan-400 tabular-nums">
                  {customInputMins}
                </span>
                <span className="block text-xs text-slate-400">دقيقة</span>
              </div>
              <button
                onClick={() => setCustomInputMins((m) => Math.min(180, m + 5))}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-lg flex items-center justify-center"
              >
                +
              </button>
            </div>

            <input
              type="range"
              min="1"
              max="180"
              value={customInputMins}
              onChange={(e) => setCustomInputMins(Number(e.target.value))}
              className="w-full accent-cyan-400 mb-6 cursor-pointer"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  timer.changePreset(customInputMins);
                  setShowCustomModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
              >
                تطبيق المدة ({customInputMins} دقيقة)
              </button>
              <button
                onClick={() => setShowCustomModal(false)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Switcher Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentThemeId={themeId}
        onSelectTheme={handleSelectTheme}
        isSystemSync={isSystemSync}
        onToggleSystemSync={handleToggleSystemSync}
        currentTheme={activeTheme}
      />

      {/* Completion Modal */}
      <CompletionModal
        isOpen={timer.status === 'completed'}
        targetMinutes={timer.selectedMinutes}
        theme={activeTheme}
        onStopBell={stopRepeatingFinishBell}
        onStartAnother={() => {
          timer.resetToIdle();
          handleStartStudy();
        }}
        onGoHome={() => {
          timer.resetToIdle();
          refreshStats();
        }}
      />

      {shareStatus && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] rounded-xl border border-cyan-400/30 bg-slate-950 px-5 py-3 text-sm text-cyan-100 shadow-xl">
          {shareStatus}
        </div>
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
