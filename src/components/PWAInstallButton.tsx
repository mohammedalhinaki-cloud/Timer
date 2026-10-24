import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ThemeConfig } from '../types/theme';

interface PWAInstallButtonProps { theme: ThemeConfig; }

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ theme }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showHelp, setShowHelp] = useState(false);
  const handleClick = async () => {
    if (isInstalled) { setShowHelp(true); return; }
    if (isInstallable && await install()) return;
    setShowHelp(true);
  };
  return (
    <>
      <button type="button" onClick={handleClick}
        className={`tenvylo-header-action ${theme.isLight ? 'tenvylo-header-action--light' : ''}`}
        title="تثبيت تطبيق تينڤيلو" aria-label="تثبيت تطبيق تينڤيلو">
        <Download size={19} strokeWidth={1.9} aria-hidden="true" />
      </button>
      {showHelp && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="tenvylo-install-title" dir="rtl"
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${theme.surfaceBg} ${theme.surfaceBorder}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 id="tenvylo-install-title" className={`font-bold text-base ${theme.timerTextColor}`}>
                {isInstalled ? 'تينڤيلو مثبت بالفعل' : 'تثبيت تينڤيلو'}
              </h2>
              <button type="button" onClick={() => setShowHelp(false)} aria-label="إغلاق"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-cyan-500/10 text-cyan-400"><X size={19}/></button>
            </div>
            <p className={`text-sm leading-7 ${theme.isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {isInstalled
                ? 'أنت تستخدم التطبيق من الشاشة الرئيسية بالفعل.'
                : isIOS
                  ? 'في Safari اضغط على زر المشاركة ثم اختر «إضافة إلى الشاشة الرئيسية».'
                  : 'من قائمة المتصفح (⋮) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». إذا لم يظهر الخيار، افتح الموقع باستخدام Chrome أو متصفح يدعم تثبيت تطبيقات الويب.'}
            </p>
            <button type="button" onClick={() => setShowHelp(false)}
              className="mt-6 w-full rounded-xl py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm">فهمت</button>
          </div>
        </div>
      )}
    </>
  );
};
