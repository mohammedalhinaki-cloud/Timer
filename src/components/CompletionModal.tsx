import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, BellOff, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { ThemeConfig } from '../types/theme';

interface CompletionModalProps {
  isOpen: boolean;
  targetMinutes: number;
  theme: ThemeConfig;
  onStopBell: () => void;
  onStartAnother: () => void;
  onGoHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen, targetMinutes, theme, onStopBell, onStartAnother, onGoHome,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const stopButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAcknowledged(false);
    stopButtonRef.current?.focus();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let alive = true;
    const colors = ['#38bdf8', '#22d3ee', '#e2e8f0', '#818cf8'];
    const rain = (x: number, angle: number) => {
      if (!alive) return;
      confetti({
        particleCount: 42, spread: 42, startVelocity: 17, gravity: 0.8,
        angle, origin: { x, y: 0.06 }, colors,
        ticks: 220, scalar: 0.75, disableForReducedMotion: true,
      });
    };
    rain(0.16, 72);
    const second = window.setTimeout(() => rain(0.84, 108), 440);
    return () => { alive = false; window.clearTimeout(second); };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#020817]/85 backdrop-blur-lg"
      role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="tenvylo-complete-title"
        aria-describedby="tenvylo-complete-desc" dir="rtl"
        className={`w-full max-w-md rounded-[28px] p-6 sm:p-9 border shadow-[0_25px_100px_rgba(0,0,0,.45)] text-center ${theme.surfaceBg} ${theme.surfaceBorder}`}>
        <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 shadow-[0_0_45px_rgba(34,211,238,.10)]">
          <Award aria-hidden="true" size={34} strokeWidth={1.65} />
        </div>
        <h2 id="tenvylo-complete-title" className={`text-2xl sm:text-[27px] font-bold leading-relaxed ${theme.timerTextColor}`}>
          أحسنت! أنهيت جلستك بنجاح
        </h2>
        <p id="tenvylo-complete-desc" className={`mt-2 text-sm leading-7 ${theme.isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          كل دقيقة تركيز تقرّبك من هدفك.
        </p>
        <div className={`my-7 inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-3 ${theme.isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
          <Clock size={18} className="text-cyan-400" aria-hidden="true" />
          <span className={`text-sm ${theme.isLight ? 'text-slate-600' : 'text-slate-300'}`}>مدة الجلسة المكتملة</span>
          <strong className="text-cyan-500 tabular-nums" dir="auto">{targetMinutes} دقيقة</strong>
        </div>
        {!acknowledged ? (
          <button ref={stopButtonRef} type="button"
            onClick={() => { onStopBell(); setAcknowledged(true); }}
            className="w-full min-h-12 flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
            <BellOff size={19} aria-hidden="true" />
            إيقاف الجرس
          </button>
        ) : (
          <div className="space-y-3">
            <button type="button" onClick={onStartAnother}
              className="w-full min-h-12 flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-colors">
              <RotateCcw size={19} aria-hidden="true" /> بدء جلسة جديدة
            </button>
            <button type="button" onClick={onGoHome}
              className={`w-full min-h-11 flex items-center justify-center gap-2 rounded-2xl border font-medium text-sm transition-colors ${theme.isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'}`}>
              العودة إلى الواجهة والإحصائيات <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
        <p role="status" className={`mt-5 text-xs ${theme.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {acknowledged ? 'تم إيقاف الجرس. استعد لإنجاز جديد.' : 'سيستمر الجرس حتى تضغط على زر إيقاف الجرس.'}
        </p>
      </section>
    </div>
  );
};
