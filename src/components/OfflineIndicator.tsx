import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-slate-950 shadow-xl border border-amber-300 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>وضع العمل دون اتصال — المؤقت والإحصائيات تعمل بكفاءة كاملة</span>
    </div>
  );
};
