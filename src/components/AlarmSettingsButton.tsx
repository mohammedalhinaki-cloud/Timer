import React, { useEffect, useState } from 'react';
import { Bell, Check, Play, Volume2, X } from 'lucide-react';
import { ThemeConfig } from '../types/theme';
import {
  ALARM_SOUNDS, AlarmSoundId, getSelectedAlarmSound,
  setSelectedAlarmSound, previewAlarmSound, stopAlarmPreview,
} from '../utils/sound';

interface Props { theme: ThemeConfig; }

/** Header action + accessible dialog with five music-free alert previews. */
export const AlarmSettingsButton: React.FC<Props> = ({ theme }) => {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState<AlarmSoundId>(getSelectedAlarmSound);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      stopAlarmPreview();
    };
  }, [open]);

  const selectSound = (id: AlarmSoundId) => {
    setSound(id);
    setSelectedAlarmSound(id);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={'tenvylo-header-action ' + (theme.isLight ? 'tenvylo-header-action--light' : '')}
        title="إعدادات صوت انتهاء الجلسة" aria-label="إعدادات صوت انتهاء الجلسة"
        aria-haspopup="dialog">
        <Bell size={19} strokeWidth={1.9} aria-hidden="true" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}>
          <section role="dialog" aria-modal="true" dir="rtl"
            aria-labelledby="tenvylo-alarm-title"
            className={'w-full max-w-md rounded-3xl border p-5 shadow-2xl sm:p-6 ' +
              (theme.isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-cyan-400/20 bg-[#0d1726] text-slate-100')}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Volume2 size={19} aria-hidden="true" />
                </span>
                <h2 id="tenvylo-alarm-title" className="text-base font-bold">صوت انتهاء الجلسة</h2>
              </div>
              <button onClick={() => setOpen(false)} type="button" aria-label="إغلاق إعدادات الصوت"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-cyan-400/10 hover:text-cyan-400">
                <X size={19} />
              </button>
            </div>
            <p className={'mb-4 text-xs leading-6 ' + (theme.isLight ? 'text-slate-500' : 'text-slate-400')}>
              اختر صوت التنبيه الذي يتكرر عند انتهاء الجلسة حتى توقفه.
            </p>
            <div role="group" aria-label="أصوات التنبيه" className="space-y-2">
              {ALARM_SOUNDS.map((item) => {
                const active = sound === item.id;
                return (
                  <div key={item.id}
                    className={'flex items-center gap-2 rounded-xl border p-2.5 transition-colors ' +
                      (active
                        ? (theme.isLight ? 'border-cyan-500/50 bg-cyan-50' : 'border-cyan-400/45 bg-cyan-400/10')
                        : (theme.isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-white/10 hover:bg-white/5'))}>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input name="tenvylo-alarm" type="radio" value={item.id}
                        checked={active} onChange={() => selectSound(item.id)}
                        className="h-4 w-4 shrink-0 accent-cyan-500" />
                      <span className="truncate text-sm font-medium">{item.label}</span>
                      {active && <Check size={15} className="shrink-0 text-cyan-400" aria-hidden="true" />}
                    </label>
                    <button type="button" onClick={() => previewAlarmSound(item.id)}
                      aria-label={'معاينة ' + item.label} title="معاينة الصوت"
                      className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ' +
                        (theme.isLight ? 'border-cyan-700/15 text-cyan-700 hover:bg-cyan-100' :
                          'border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/15')}>
                      <Play size={16} fill="currentColor" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-300">
              تم
            </button>
          </section>
        </div>
      )}
    </>
  );
};
