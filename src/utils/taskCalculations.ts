import { DailyTask } from '../types';

/**
 * Calculates completion percentage for an array of tasks.
 * Returns rounded integer between 0 and 100.
 */
export function calculateCompletionRate(tasks: DailyTask[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completedCount = tasks.filter(t => t.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * Computes hours and minutes remaining until midnight for the 24-hour cycle.
 */
export function getRemainingDayTime(now: Date = new Date()): { hours: number; minutes: number; totalMinutes: number; percentageRemaining: number } {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight
  const diffMs = midnight.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalDayMinutes = 24 * 60;
  const percentageRemaining = Math.round((totalMinutes / totalDayMinutes) * 100);

  return { hours, minutes, totalMinutes, percentageRemaining };
}

/**
 * Groups tasks by date.
 */
export function groupTasksByDate(tasks: DailyTask[]): Record<string, DailyTask[]> {
  const grouped: Record<string, DailyTask[]> = {};
  for (const task of tasks) {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  }
  return grouped;
}

/**
 * Computes weekly completion report from daily archives or task history.
 */
export function computeWeeklySummary(dailyRecords: { date: string; completionPercentage: number }[]): {
  averageCompletion: number;
  bestDay: string | null;
  recordedDays: number;
} {
  if (!dailyRecords || dailyRecords.length === 0) {
    return { averageCompletion: 0, bestDay: null, recordedDays: 0 };
  }

  const sum = dailyRecords.reduce((acc, curr) => acc + curr.completionPercentage, 0);
  const averageCompletion = Math.round(sum / dailyRecords.length);

  let bestDay: string | null = null;
  let highest = -1;

  for (const item of dailyRecords) {
    if (item.completionPercentage > highest) {
      highest = item.completionPercentage;
      bestDay = item.date;
    }
  }

  return {
    averageCompletion,
    bestDay,
    recordedDays: dailyRecords.length,
  };
}

/**
 * Month names lookup
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Computes Jan-Dec yearly rollup breakdown.
 */
export function computeYearlyMonthBreakdown(
  year: number,
  dailyArchives: Record<string, { completionPercentage: number; totalTasks: number; completedTasks: number }>
): Array<{
  monthIndex: number;
  monthName: string;
  monthKey: string;
  averageRate: number;
  totalDaysLogged: number;
  totalCompletedTasks: number;
}> {
  return MONTH_NAMES.map((name, idx) => {
    const monthStr = String(idx + 1).padStart(2, '0');
    const monthKey = `${year}-${monthStr}`;

    const matchingDays = Object.entries(dailyArchives).filter(([dateKey]) =>
      dateKey.startsWith(monthKey)
    );

    if (matchingDays.length === 0) {
      return {
        monthIndex: idx,
        monthName: name,
        monthKey,
        averageRate: 0,
        totalDaysLogged: 0,
        totalCompletedTasks: 0,
      };
    }

    const totalRate = matchingDays.reduce((acc, [, val]) => acc + val.completionPercentage, 0);
    const totalCompleted = matchingDays.reduce((acc, [, val]) => acc + val.completedTasks, 0);

    return {
      monthIndex: idx,
      monthName: name,
      monthKey,
      averageRate: Math.round(totalRate / matchingDays.length),
      totalDaysLogged: matchingDays.length,
      totalCompletedTasks: totalCompleted,
    };
  });
}
