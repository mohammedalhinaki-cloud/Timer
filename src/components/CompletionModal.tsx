import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types/theme';

interface CompletionModalProps {
  isOpen: boolean;
  targetMinutes: number;
  theme: ThemeConfig;
  onStartAnother: () => void;
  onGoHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  targetMinutes,
  theme,
  onStartAnother,
  onGoHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        // Gentle elegant confetti burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
          disableForReducedMotion: true,
        });
      } catch {
        // silent
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border text-center ${theme.surfaceBg} ${theme.surfaceBorder}`}
      >
        {/* Zen Achievement Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 shadow-[0_0_24px_rgba(56,189,248,0.3)]">
          <Award className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold mb-2 ${theme.timerTextColor}`}>
          أحسنت صنعاً! إنجاز رائع 🌟
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          أتممت جلسة مذاكرة كاملة بتركيز مطلق. عقلك يستحق كل التقدير على هذا الالتزام والاستمرار.
        </p>

        {/* Stats Pill */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 mb-8">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>المدة المكتملة:</span>
          </div>
          <span className="text-base font-bold font-mono text-cyan-300 tabular-nums">
            {targetMinutes} دقيقة تركيز
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onStartAnother}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بدء جلسة مذاكرة جديدة</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition"
          >
            <span>العودة للواجهة الرئيسية والإحصائيات</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Zen Quote */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>«القطرات المستمرة تصنع مجرى النهر»</span>
        </div>
      </div>
    </div>
  );
};
