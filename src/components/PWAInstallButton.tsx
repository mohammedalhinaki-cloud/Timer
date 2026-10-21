import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ThemeConfig } from '../types/theme';

interface PWAInstallButtonProps {
  theme: ThemeConfig;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ theme }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or running in standalone mode, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${theme.surfaceBorder} ${
          theme.isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-slate-200'
        }`}
        title="تثبيت التطبيق على جهازك"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${theme.surfaceBorder} ${
            theme.isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/5 hover:bg-white/10 text-slate-200'
          }`}
          title="تثبيت على iPhone أو iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>تثبيت PWA</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${theme.surfaceBg} ${theme.surfaceBorder} text-right`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-base font-semibold ${theme.timerTextColor}`}>
                  تثبيت تينڤيلو على الآيفون والآيباد
                </h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">1</span>
                  <p>اضغط على أيقونة <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">2</span>
                  <p>مرر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">3</span>
                  <p>اضغط <strong>إضافة (Add)</strong> بالأعلى لتثبيت التطبيق واستخدامه دون اتصال وبملء الشاشة.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-6 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium py-2.5 text-sm transition"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
