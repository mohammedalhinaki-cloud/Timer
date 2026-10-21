import React from 'react';
import { ThemeConfig } from '../types/theme';
import { ADS_ENABLED } from '../config/ads';

interface AdSlotProps {
  format?: 'banner' | 'rectangle' | 'adaptive';
  slotId?: string;
  isFocusActive: boolean;
  theme: ThemeConfig;
  className?: string;
}

/**
 * AdSlot Component.
 * - Completely returns null when ADS_ENABLED is false (default) or when in Focus Mode.
 * - Leaves zero space or empty placeholders.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  format = 'adaptive',
  slotId = 'tenvylo-home-banner',
  isFocusActive,
  theme,
  className = '',
}) => {
  // If ads are disabled globally or focus mode is active, render nothing at all
  if (!ADS_ENABLED || isFocusActive) {
    return null;
  }

  const formatStyles = {
    banner: 'min-h-[90px] max-w-[728px] w-full',
    rectangle: 'min-h-[250px] max-w-[336px] w-full',
    adaptive: 'min-h-[75px] sm:min-h-[90px] w-full max-w-3xl',
  };

  return (
    <div
      data-ad-slot-id={slotId}
      className={`mx-auto transition-opacity duration-300 ${formatStyles[format]} ${className}`}
      aria-label="مساحة إعلانية"
    >
      <div
        className={`w-full h-full rounded-2xl border border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors ${
          theme.isLight
            ? 'border-slate-300 bg-slate-100/60 text-slate-500'
            : 'border-white/10 bg-white/[0.02] text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
            مساحة إعلانية
          </span>
          <span className="text-[11px] text-slate-400">Google AdSense</span>
        </div>
      </div>
    </div>
  );
};
