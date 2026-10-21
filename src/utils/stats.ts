import { StudySessionLog, DayStat, StudyStatsSummary } from '../types/stats';

const STORAGE_SESSIONS_KEY = 'tenvylo_study_sessions_v1';

export function getTodayDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getAllSessions(): StudySessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load study sessions:', err);
    return [];
  }
}

export function saveAllSessions(sessions: StudySessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save study sessions:', err);
  }
}

export function logCompletedSession(params: {
  durationSeconds: number;
  mode: 'countdown' | 'stopwatch';
  targetMinutes?: number;
  completed: boolean;
}): StudySessionLog {
  const durationMinutes = Math.max(1, Math.round(params.durationSeconds / 60));
  const newLog: StudySessionLog = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateStr: getTodayDateStr(),
    durationSeconds: params.durationSeconds,
    durationMinutes,
    mode: params.mode,
    targetMinutes: params.targetMinutes,
    completed: params.completed,
  };

  const sessions = getAllSessions();
  sessions.unshift(newLog); // latest first
  // Keep last 1000 sessions to avoid unbounded storage
  if (sessions.length > 1000) {
    sessions.length = 1000;
  }
  saveAllSessions(sessions);
  return newLog;
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_DAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export function calculateStatsSummary(sessions: StudySessionLog[] = getAllSessions()): StudyStatsSummary {
  const todayStr = getTodayDateStr();

  let todayMinutes = 0;
  let todaySessionsCount = 0;
  let totalAllTimeMinutes = 0;
  let totalCompletedSessions = 0;

  // Map to sum minutes per day
  const dailyMinutesMap = new Map<string, { minutes: number; count: number }>();

  sessions.forEach((s) => {
    totalAllTimeMinutes += s.durationMinutes;
    if (s.completed) {
      totalCompletedSessions += 1;
    }

    const current = dailyMinutesMap.get(s.dateStr) || { minutes: 0, count: 0 };
    current.minutes += s.durationMinutes;
    if (s.completed) {
      current.count += 1;
    }
    dailyMinutesMap.set(s.dateStr, current);

    if (s.dateStr === todayStr) {
      todayMinutes += s.durationMinutes;
      if (s.completed) {
        todaySessionsCount += 1;
      }
    }
  });

  // Calculate Streak
  let currentStreak = 0;
  const checkDate = new Date();
  
  // Check today first
  const todayData = dailyMinutesMap.get(getTodayDateStr(checkDate));
  if (todayData && todayData.minutes > 0) {
    currentStreak += 1;
  }
  
  // Check backward consecutive days
  checkDate.setDate(checkDate.getDate() - 1);
  while (true) {
    const dStr = getTodayDateStr(checkDate);
    const dayData = dailyMinutesMap.get(dStr);
    if (dayData && dayData.minutes > 0) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    // safety guard
    if (currentStreak > 3650) break;
  }

  // Generate last 7 days (from 6 days ago up to today)
  const last7Days: DayStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = getTodayDateStr(d);
    const isToday = dStr === todayStr;
    const dayIndex = d.getDay();
    const dayInfo = dailyMinutesMap.get(dStr) || { minutes: 0, count: 0 };

    last7Days.push({
      dateStr: dStr,
      dayLabel: isToday ? 'اليوم' : ARABIC_DAYS[dayIndex],
      dayShort: isToday ? 'اليوم' : ARABIC_DAYS_SHORT[dayIndex],
      totalMinutes: dayInfo.minutes,
      sessionCount: dayInfo.count,
      isToday,
    });
  }

  return {
    todayMinutes,
    todaySessionsCount,
    totalAllTimeMinutes,
    totalCompletedSessions,
    currentStreakDays: currentStreak,
    last7Days,
  };
}
