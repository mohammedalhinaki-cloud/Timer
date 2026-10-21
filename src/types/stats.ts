export interface StudySessionLog {
  id: string;
  timestamp: number; // Date.now() when session was logged
  dateStr: string;   // YYYY-MM-DD in local time
  durationSeconds: number;
  durationMinutes: number;
  mode: 'countdown' | 'stopwatch';
  targetMinutes?: number;
  completed: boolean; // True if full countdown was completed
}

export interface DayStat {
  dateStr: string;
  dayLabel: string; // e.g. "السبت", "الأحد", "اليوم"
  dayShort: string; // e.g. "سبت", "أحد"
  totalMinutes: number;
  sessionCount: number;
  isToday: boolean;
}

export interface StudyStatsSummary {
  todayMinutes: number;
  todaySessionsCount: number;
  totalAllTimeMinutes: number;
  totalCompletedSessions: number;
  currentStreakDays: number;
  last7Days: DayStat[];
}
