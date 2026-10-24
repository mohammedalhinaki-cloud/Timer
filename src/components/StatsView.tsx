import React, { useState } from 'react';
import { Flame, Clock, Award, ChartNoAxesColumnIncreasing, Calendar, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudyStatsSummary, StudySessionLog } from '../types/stats';
import { ThemeConfig } from '../types/theme';
import { saveAllSessions } from '../utils/stats';

interface StatsViewProps {
  stats: StudyStatsSummary;
  allSessions: StudySessionLog[];
  onRefreshStats: () => void;
  theme: ThemeConfig;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  allSessions,
  onRefreshStats,
  theme,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Find max minutes in last 7 days for relative bar height
  const maxDayMinutes = Math.max(1, ...stats.last7Days.map((d) => d.totalMinutes));

  const handleResetData = () => {
    saveAllSessions([]);
    onRefreshStats();
    setShowConfirmReset(false);
    setShowHistoryModal(false);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <ChartNoAxesColumnIncreasing className="w-4 h-4" />
          </div>
          <h2 className={`text-base sm:text-lg font-bold ${theme.timerTextColor}`}>
            إحصائيات إنجازك
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition ${
              theme.isLight
                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                : 'border-white/10 hover:bg-white/10 text-slate-300'
            }`}
          >
            سجل الجلسات ({allSessions.length})
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 mb-4 sm:mb-6">
        {/* Today's Minutes */}
        <div
          className={`p-4 rounded-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>مذاكرة اليوم</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${theme.timerTextColor}`}>
              {stats.todayMinutes}
            </span>
            <span className="text-xs text-slate-400">دقيقة</span>
          </div>
          <div className="text-[11px] text-slate-400/80 mt-1">
            {(stats.todayMinutes / 60).toFixed(1)} ساعة إنجاز
          </div>
        </div>

        {/* Completed Sessions Today */}
        <div
          className={`p-4 rounded-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>جلسات اليوم المكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${theme.timerTextColor}`}>
              {stats.todaySessionsCount}
            </span>
            <span className="text-xs text-slate-400">جلسة</span>
          </div>
          <div className="text-[11px] text-slate-400/80 mt-1">
            مكتملة بدقة وبدون انقطاع
          </div>
        </div>

        {/* Current Streak */}
        <div
          className={`p-4 rounded-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>سلسلة الالتزام</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${theme.timerTextColor}`}>
              {stats.currentStreakDays}
            </span>
            <span className="text-xs text-slate-400">أيام</span>
          </div>
          <div className="text-[11px] text-slate-400/80 mt-1">
            {stats.currentStreakDays > 0 ? 'استمر في الزخم اليومي!' : 'ابدأ جلستك الأولى اليوم'}
          </div>
        </div>

        {/* All-Time Sessions */}
        <div
          className={`p-4 rounded-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>إجمالي الجلسات</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${theme.timerTextColor}`}>
              {stats.totalCompletedSessions}
            </span>
            <span className="text-xs text-slate-400">جلسة</span>
          </div>
          <div className="text-[11px] text-slate-400/80 mt-1">
            {stats.totalAllTimeMinutes} دقيقة إجمالية
          </div>
        </div>
      </div>

      {/* 7-Day Chart Box */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${theme.surfaceBg} ${theme.surfaceBorder}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`text-sm font-semibold ${theme.timerTextColor}`}>
              نشاط المذاكرة خلال آخر 7 أيام
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مجموع الدقائق المنجزة في كل يوم
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>الأسبوع الجاري</span>
          </div>
        </div>

        {/* Custom Lightweight SVG / HTML Bar Chart */}
        <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-1">
          {stats.last7Days.map((day) => {
            const heightPercent = Math.max(6, Math.round((day.totalMinutes / maxDayMinutes) * 100));
            const hasActivity = day.totalMinutes > 0;

            return (
              <div
                key={day.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                {/* Tooltip on hover / minutes indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-mono text-cyan-400 mb-1 pointer-events-none tabular-nums font-semibold">
                  {day.totalMinutes}د
                </div>

                {/* Bar */}
                <div className="w-full max-w-[42px] bg-slate-800/40 rounded-xl overflow-hidden p-0.5 flex flex-col justify-end h-32">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 relative ${
                      day.isToday
                        ? 'bg-gradient-to-t from-cyan-500 to-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                        : hasActivity
                        ? 'bg-gradient-to-t from-slate-600 to-cyan-500/70'
                        : 'bg-white/5'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] sm:text-xs font-medium ${
                      day.isToday
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 tabular-nums">
                    {day.totalMinutes > 0 ? `${day.totalMinutes}د` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} max-h-[85vh] flex flex-col`}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className={`text-base font-bold ${theme.timerTextColor}`}>
                سجل جلسات المذاكرة
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1 transition"
                  title="تصفير السجل"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {allSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  لا توجد جلسات مسجلة بعد. ابدأ جلستك الأولى الآن!
                </div>
              ) : (
                allSessions.map((session) => {
                  const date = new Date(session.timestamp);
                  const timeFormatted = date.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            session.completed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {session.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">
                            {session.durationMinutes} دقيقة{' '}
                            {session.mode === 'stopwatch' ? '(مؤقت تصاعدي)' : '(مؤقت محدد)'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {session.dateStr} • {timeFormatted}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          session.completed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {session.completed ? 'مكتملة' : 'منتهية مبكراً'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Confirm Reset Alert inside history */}
            {showConfirmReset && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs">
                <div className="flex items-center gap-2 font-semibold mb-2 text-rose-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>هل أنت متأكد من تصفير سجل المذاكرة بالكامل؟</span>
                </div>
                <p className="text-[11px] text-rose-300/80 mb-3">
                  سيتم حذف جميع إحصائيات الجلسات والأيام السابقة نهائياً من المتصفح.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleResetData}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition"
                  >
                    نعم، حذف البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
