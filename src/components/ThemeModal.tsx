import React from 'react';
import { X, Check, Monitor, Sparkles } from 'lucide-react';
import { THEMES, ThemeId, ThemeConfig } from '../types/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  isSystemSync: boolean;
  onToggleSystemSync: (val: boolean) => void;
  currentTheme: ThemeConfig;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  isSystemSync,
  onToggleSystemSync,
  currentTheme,
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${currentTheme.timerTextColor}`}>
                سمات المظهر الفاخرة
              </h2>
              <p className="text-xs text-slate-400">
                اختر الأجواء البصرية التي تمنحك أقصى درجات السكينة أثناء المذاكرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Theme Sync Toggle */}
        <div className="mb-5 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-200">
                متابعة مظهر النظام تلقائيًا
              </div>
              <div className="text-xs text-slate-400">
                التبديل التلقائي بين الأبيض النقي والسمات الداكنة حسب تفضيل جهازك
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isSystemSync}
            onClick={() => onToggleSystemSync(!isSystemSync)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSystemSync ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSystemSync ? 'translate-x-0' : '-translate-x-5'
              }`}
            />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themeList.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  if (isSystemSync) onToggleSystemSync(false);
                }}
                className={`relative group flex items-start gap-3.5 p-3.5 rounded-2xl border text-right transition-all duration-200 ${
                  isSelected
                    ? `ring-2 ring-cyan-400 shadow-lg ${theme.surfaceBg} ${theme.surfaceBorder}`
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                {/* Color preview circle */}
                <div
                  className="w-10 h-10 rounded-2xl flex-shrink-0 shadow-inner flex items-center justify-center border border-white/20 mt-0.5"
                  style={{
                    backgroundColor: theme.id === 'amoled' ? '#000000' : theme.accentColor,
                    backgroundImage: theme.id === 'minimal-light' ? 'linear-gradient(135deg, #ffffff, #cbd5e1)' : undefined,
                  }}
                >
                  {isSelected && (
                    <Check
                      className={`w-5 h-5 ${theme.isLight ? 'text-slate-900' : 'text-slate-950 font-bold'}`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">
                      {theme.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {theme.nameEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>يتم حفظ اختيارك تلقائيًا في ذاكرة المتصفح</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
