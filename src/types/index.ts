export type TimeCategory = 'Productive' | 'Necessary' | 'Leisure / Rest' | 'Unproductive' | 'Unrecorded';

export interface DailyTask {
  id: string;
  title: string;
  category: TimeCategory;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface HourSlot {
  hour: number; // 0 to 23
  category: TimeCategory;
  activity: string;
  updatedAt?: string;
}

export interface DayTimeRecord {
  date: string; // YYYY-MM-DD
  slots: Record<number, HourSlot>; // 0..23
  notes?: string;
}

export type ReminderPriority = 'High' | 'Medium' | 'Low';
export type ReminderFrequency = 'None' | 'Daily' | 'Weekly' | 'Monthly';
export type ReminderType = 'Appointment' | 'Meeting' | 'Deadline' | 'Event' | 'Personal';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  frequency: ReminderFrequency;
  scheduledTime: string; // ISO string or YYYY-MM-DDTHH:mm
  completed: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

export interface HabitTimingItem {
  id: string;
  title: string;
  category: TimeCategory;
  targetStartTime: string; // e.g. "07:00"
  targetEndTime: string;   // e.g. "07:45"
  daysOfWeek: number[];    // 0=Sun, 1=Mon, ..., 6=Sat
  // Record of logs by date YYYY-MM-DD
  logs: Record<string, {
    actualStartTime: string; // "07:12"
    actualEndTime: string;   // "07:50"
    completed: boolean;
    notes?: string;
  }>;
  createdAt: string;
}

export interface DayArchive {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  categoryHours: Record<TimeCategory, number>;
}

export interface MonthArchive {
  monthKey: string; // e.g. "2026-01" to "2026-12"
  monthName: string; // "January", etc.
  totalTasks: number;
  completedTasks: number;
  averageCompletionPercentage: number;
  daysLogged: number;
  categoryHours: Record<TimeCategory, number>;
}

export interface NudgeSettings {
  enabled: boolean;
  intervalMinutes: number; // default 30
  soundEnabled: boolean;
  chattyStyle: 'friendly' | 'coach' | 'zen';
  lastNudgeTimestamp?: number;
}
