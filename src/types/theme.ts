export type ThemeId =
  | 'midnight'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'minimal-light'
  | 'amoled'
  | 'lavender';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameEn: string;
  description: string;
  isLight: boolean;
  bgGradient: string;
  surfaceBg: string;
  surfaceBorder: string;
  accentColor: string; // Tailwind color class or hex
  accentBg: string;
  accentText: string;
  accentGlow: string;
  timerTextColor: string;
  secondaryTextColor: string;
  progressRingColor: string;
  badgeBg: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'منتصف الليل',
    nameEn: 'Midnight',
    description: 'أسود عميق مع لمسات نيلية وزرقاء هادئة ومريحة لأقصى درجات التركيز الليلي',
    isLight: false,
    bgGradient: 'bg-gradient-to-b from-[#0a0f1d] via-[#070b14] to-[#04060a]',
    surfaceBg: 'bg-[#101728]/70 backdrop-blur-xl',
    surfaceBorder: 'border-cyan-500/15',
    accentColor: '#38bdf8',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    accentText: 'text-cyan-400',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    timerTextColor: 'text-cyan-50',
    secondaryTextColor: 'text-slate-400',
    progressRingColor: '#38bdf8',
    badgeBg: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40',
  },
  ocean: {
    id: 'ocean',
    name: 'المحيط الهادئ',
    nameEn: 'Ocean',
    description: 'تدرجات بحرية عميقة مستوحاة من هدوء أعماق المحيط وانتعاش الأمواج',
    isLight: false,
    bgGradient: 'bg-gradient-to-b from-[#0b192c] via-[#061220] to-[#03080f]',
    surfaceBg: 'bg-[#0e243d]/70 backdrop-blur-xl',
    surfaceBorder: 'border-sky-400/20',
    accentColor: '#0ea5e9',
    accentBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    accentText: 'text-sky-400',
    accentGlow: 'rgba(14, 165, 233, 0.25)',
    timerTextColor: 'text-sky-50',
    secondaryTextColor: 'text-sky-200/70',
    progressRingColor: '#0ea5e9',
    badgeBg: 'bg-sky-950/60 text-sky-300 border border-sky-800/40',
  },
  forest: {
    id: 'forest',
    name: 'الغابة العميقة',
    nameEn: 'Forest',
    description: 'أخضر زمردي طبيعي مستوحى من سكون الغابات الاستوائية والراحة البصرية',
    isLight: false,
    bgGradient: 'bg-gradient-to-b from-[#061c14] via-[#04130d] to-[#020906]',
    surfaceBg: 'bg-[#0a271c]/70 backdrop-blur-xl',
    surfaceBorder: 'border-emerald-500/20',
    accentColor: '#10b981',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    accentText: 'text-emerald-400',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    timerTextColor: 'text-emerald-50',
    secondaryTextColor: 'text-emerald-200/70',
    progressRingColor: '#10b981',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40',
  },
  sunset: {
    id: 'sunset',
    name: 'أفق الغروب',
    nameEn: 'Sunset',
    description: 'ألوان الشفق الدافئة بمزيج العنبر والبرتقالي الداكن لسكينة المساء',
    isLight: false,
    bgGradient: 'bg-gradient-to-b from-[#1c0e0b] via-[#140907] to-[#0a0403]',
    surfaceBg: 'bg-[#2b1410]/70 backdrop-blur-xl',
    surfaceBorder: 'border-amber-500/20',
    accentColor: '#f59e0b',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    accentText: 'text-amber-400',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    timerTextColor: 'text-amber-50',
    secondaryTextColor: 'text-amber-200/70',
    progressRingColor: '#f59e0b',
    badgeBg: 'bg-amber-950/60 text-amber-300 border border-amber-800/40',
  },
  'minimal-light': {
    id: 'minimal-light',
    name: 'الأبيض النقي',
    nameEn: 'Minimal Light',
    description: 'أبيض نقي ومينيمالي فائق النظافة مستوحى من البساطة المعمارية الأنيقة',
    isLight: true,
    bgGradient: 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    surfaceBg: 'bg-white/80 backdrop-blur-xl',
    surfaceBorder: 'border-slate-300/60',
    accentColor: '#0f172a',
    accentBg: 'bg-slate-900 hover:bg-slate-800 text-white',
    accentText: 'text-slate-900',
    accentGlow: 'rgba(15, 23, 42, 0.1)',
    timerTextColor: 'text-slate-900',
    secondaryTextColor: 'text-slate-600',
    progressRingColor: '#0f172a',
    badgeBg: 'bg-slate-100 text-slate-800 border border-slate-300/70',
  },
  amoled: {
    id: 'amoled',
    name: 'أموليد فائق السواد',
    nameEn: 'AMOLED Pure Black',
    description: 'أسود مطلق 100% مخصص لتوفير البطارية على شاشات OLED وأعلى درجات التباين',
    isLight: false,
    bgGradient: 'bg-[#000000]',
    surfaceBg: 'bg-[#0d0d0d]/90 backdrop-blur-xl',
    surfaceBorder: 'border-white/10',
    accentColor: '#ffffff',
    accentBg: 'bg-white hover:bg-gray-200 text-black',
    accentText: 'text-white',
    accentGlow: 'rgba(255, 255, 255, 0.2)',
    timerTextColor: 'text-white',
    secondaryTextColor: 'text-neutral-400',
    progressRingColor: '#ffffff',
    badgeBg: 'bg-neutral-900 text-neutral-300 border border-neutral-800',
  },
  lavender: {
    id: 'lavender',
    name: 'اللافندر الملكي',
    nameEn: 'Lavender',
    description: 'أرجواني بنفسجي ناعم وفاخر يمنح إحساساً بالتأمل والاسترخاء الذهني',
    isLight: false,
    bgGradient: 'bg-gradient-to-b from-[#150d1e] via-[#0d0713] to-[#060309]',
    surfaceBg: 'bg-[#20142e]/70 backdrop-blur-xl',
    surfaceBorder: 'border-purple-400/20',
    accentColor: '#c084fc',
    accentBg: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
    accentText: 'text-purple-300',
    accentGlow: 'rgba(192, 132, 252, 0.25)',
    timerTextColor: 'text-purple-50',
    secondaryTextColor: 'text-purple-200/70',
    progressRingColor: '#c084fc',
    badgeBg: 'bg-purple-950/60 text-purple-300 border border-purple-800/40',
  },
};
