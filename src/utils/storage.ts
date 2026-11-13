import {
  DailyTask,
  HourSlot,
  ReminderItem,
  HabitTimingItem,
  DayArchive,
  NudgeSettings,
} from '../types';
import { createDefaultDaySlots, calculateCategoryStats } from './timeframeCalculations';
import { calculateCompletionRate } from './taskCalculations';

const STORAGE_KEYS = {
  TASKS: 'piku_tasks_v2',
  TIMEFRAMES: 'piku_timeframes_v2',
  REMINDERS: 'piku_reminders_v2',
  HABITS: 'piku_habits_v2',
  ARCHIVES: 'piku_archives_v2',
  NUDGE_SETTINGS: 'piku_nudge_settings_v2',
  LAST_MORNING_PROMPT: 'piku_last_morning_date',
};

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seed initial realistic data if fresh installation
export function initializeSeedData(): void {
  if (typeof window === 'undefined') return;

  const today = getTodayKey();
  const hasTasks = localStorage.getItem(STORAGE_KEYS.TASKS);

  if (!hasTasks) {
    const seedTasks: DailyTask[] = [
      {
        id: 'task-1',
        title: 'Review Daily Sprint Goals & Priorities',
        category: 'Productive',
        estimatedMinutes: 30,
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdAt: new Date().toISOString(),
        date: today,
      },
      {
        id: 'task-2',
        title: 'Complete Mobile Architecture Documentation',
        category: 'Productive',
        estimatedMinutes: 90,
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdAt: new Date().toISOString(),
        date: today,
      },
      {
        id: 'task-3',
        title: 'Team Sync & Standup Discussion',
        category: 'Necessary',
        estimatedMinutes: 45,
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        createdAt: new Date().toISOString(),
        date: today,
      },
      {
        id: 'task-4',
        title: 'Analyze User Feedback on 24h Timeframe Tracker',
        category: 'Productive',
        estimatedMinutes: 60,
        completed: false,
        createdAt: new Date().toISOString(),
        date: today,
      },
      {
        id: 'task-5',
        title: 'Evening 30-min Reading & Wind-down',
        category: 'Leisure / Rest',
        estimatedMinutes: 30,
        completed: false,
        createdAt: new Date().toISOString(),
        date: today,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));

    // Seed Timeframe slots
    const slots = createDefaultDaySlots();
    // 08:00 - 09:00: Breakfast & Morning Routine (Necessary)
    slots[8] = { hour: 8, category: 'Necessary', activity: 'Breakfast & Morning Routine' };
    // 09:00 - 11:00: Deep Work & Architecture (Productive)
    slots[9] = { hour: 9, category: 'Productive', activity: 'Sprint Planning & Prioritization' };
    slots[10] = { hour: 10, category: 'Productive', activity: 'Mobile Offline Engine Development' };
    slots[11] = { hour: 11, category: 'Productive', activity: 'Documentation & Code Review' };
    // 12:00 - 13:00: Lunch Break (Necessary)
    slots[12] = { hour: 12, category: 'Necessary', activity: 'Lunch & Fresh Air' };
    // 13:00 - 14:00: Team Standup (Necessary)
    slots[13] = { hour: 13, category: 'Necessary', activity: 'Team Sync & Standup' };
    // 14:00 - 16:00: Feature Implementation (Productive)
    slots[14] = { hour: 14, category: 'Productive', activity: 'Timeframe Color Code Implementation' };
    slots[15] = { hour: 15, category: 'Productive', activity: '30-Minute Dynamic Nudge Flow' };
    // 16:00 - 17:00: Quick Coffee Break (Leisure / Rest)
    slots[16] = { hour: 16, category: 'Leisure / Rest', activity: 'Coffee & Short Walk' };

    const timeframes: Record<string, Record<number, HourSlot>> = {
      [today]: slots,
    };
    localStorage.setItem(STORAGE_KEYS.TIMEFRAMES, JSON.stringify(timeframes));

    // Seed Reminders
    const seedReminders: ReminderItem[] = [
      {
        id: 'rem-1',
        title: 'Project Strategy Call',
        description: 'Review Q4 release milestones and Android APK build status',
        type: 'Meeting',
        priority: 'High',
        frequency: 'Daily',
        scheduledTime: `${today}T15:30:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem-2',
        title: 'Doctor Appointment - Annual Checkup',
        description: 'Bring health reports and vaccination card',
        type: 'Appointment',
        priority: 'High',
        frequency: 'None',
        scheduledTime: `${today}T17:00:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem-3',
        title: 'Submit Weekly Progress Timesheet',
        description: 'Log timeframe breakdown across categories',
        type: 'Deadline',
        priority: 'Medium',
        frequency: 'Weekly',
        scheduledTime: `${today}T18:00:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(seedReminders));

    // Seed Habits with time tracking
    const seedHabits: HabitTimingItem[] = [
      {
        id: 'habit-1',
        title: 'Morning Cardio & Stretching',
        category: 'Productive',
        targetStartTime: '07:00',
        targetEndTime: '07:45',
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        logs: {
          [today]: {
            actualStartTime: '07:05',
            actualEndTime: '07:48',
            completed: true,
            notes: 'Felt energized, completed 3km jog',
          },
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-2',
        title: 'Deep Focus Reading Session',
        category: 'Leisure / Rest',
        targetStartTime: '21:30',
        targetEndTime: '22:15',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        logs: {},
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-3',
        title: 'Meditation & Breathwork',
        category: 'Necessary',
        targetStartTime: '06:45',
        targetEndTime: '07:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        logs: {
          [today]: {
            actualStartTime: '06:45',
            actualEndTime: '07:02',
            completed: true,
          },
        },
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(seedHabits));

    // Seed past archives to populate weekly and Jan-Dec monthly trends!
    const archives: Record<string, DayArchive> = {};
    const dObj = new Date();

    // Populate past 14 days and past months
    for (let i = 1; i <= 35; i++) {
      const past = new Date(dObj);
      past.setDate(past.getDate() - i);
      const y = past.getFullYear();
      const m = String(past.getMonth() + 1).padStart(2, '0');
      const dayStr = String(past.getDate()).padStart(2, '0');
      const pKey = `${y}-${m}-${dayStr}`;

      const totalTasks = 4 + (i % 3);
      const completedTasks = Math.max(2, totalTasks - (i % 2));
      const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

      archives[pKey] = {
        date: pKey,
        totalTasks,
        completedTasks,
        completionPercentage,
        categoryHours: {
          'Productive': 6 + (i % 3),
          'Necessary': 4,
          'Leisure / Rest': 3 + (i % 2),
          'Unproductive': i % 2,
          'Unrecorded': 10 - (i % 3),
        },
      };
    }

    // Also populate past months in the year for full Jan-Dec calendar
    for (let monthIdx = 1; monthIdx <= 12; monthIdx++) {
      const mStr = String(monthIdx).padStart(2, '0');
      const testDay = `${dObj.getFullYear()}-${mStr}-15`;
      if (!archives[testDay]) {
        archives[testDay] = {
          date: testDay,
          totalTasks: 5,
          completedTasks: 4,
          completionPercentage: 75 + (monthIdx % 20),
          categoryHours: {
            'Productive': 7,
            'Necessary': 4,
            'Leisure / Rest': 3,
            'Unproductive': 1,
            'Unrecorded': 9,
          },
        };
      }
    }

    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));

    // Seed default nudge settings
    const defaultNudge: NudgeSettings = {
      enabled: true,
      intervalMinutes: 30,
      soundEnabled: true,
      chattyStyle: 'friendly',
      lastNudgeTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.NUDGE_SETTINGS, JSON.stringify(defaultNudge));
  }
}

export const Storage = {
  getTasks(): DailyTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveTasks(tasks: DailyTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getTimeframes(): Record<string, Record<number, HourSlot>> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMEFRAMES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  getDayTimeframe(dateKey: string): Record<number, HourSlot> {
    const all = this.getTimeframes();
    if (!all[dateKey]) {
      all[dateKey] = createDefaultDaySlots();
      this.saveTimeframes(all);
    }
    return all[dateKey];
  },

  saveDayTimeframe(dateKey: string, slots: Record<number, HourSlot>): void {
    const all = this.getTimeframes();
    all[dateKey] = slots;
    this.saveTimeframes(all);
  },

  saveTimeframes(data: Record<string, Record<number, HourSlot>>): void {
    localStorage.setItem(STORAGE_KEYS.TIMEFRAMES, JSON.stringify(data));
  },

  getReminders(): ReminderItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getHabits(): HabitTimingItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveHabits(habits: HabitTimingItem[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getArchives(): Record<string, DayArchive> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveDayArchive(dateKey: string, tasks: DailyTask[], slots: Record<number, HourSlot>): void {
    const archives = this.getArchives();
    const dayTasks = tasks.filter(t => t.date === dateKey);
    const catStats = calculateCategoryStats(slots);

    archives[dateKey] = {
      date: dateKey,
      totalTasks: dayTasks.length,
      completedTasks: dayTasks.filter(t => t.completed).length,
      completionPercentage: calculateCompletionRate(dayTasks),
      categoryHours: catStats.hoursByCategory,
    };
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
  },

  getNudgeSettings(): NudgeSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NUDGE_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      enabled: true,
      intervalMinutes: 30,
      soundEnabled: true,
      chattyStyle: 'friendly',
    };
  },

  saveNudgeSettings(settings: NudgeSettings): void {
    localStorage.setItem(STORAGE_KEYS.NUDGE_SETTINGS, JSON.stringify(settings));
  },

  getLastMorningPrompt(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_MORNING_PROMPT);
  },

  setLastMorningPrompt(dateKey: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_MORNING_PROMPT, dateKey);
  },
};
