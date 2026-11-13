import { ReminderItem, ReminderFrequency, ReminderPriority } from '../types';

/**
 * Calculates next schedule date for recurring reminders.
 */
export function calculateNextOccurrence(currentTime: Date, frequency: ReminderFrequency): Date {
  const next = new Date(currentTime);
  switch (frequency) {
    case 'Daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'Weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'Monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'None':
    default:
      break;
  }
  return next;
}

/**
 * Calculates snoozed timestamp.
 */
export function calculateSnoozeTime(minutes: number, baseDate: Date = new Date()): string {
  const snoozed = new Date(baseDate.getTime() + minutes * 60 * 1000);
  return snoozed.toISOString();
}

/**
 * Checks if a reminder is currently due (scheduled time <= now and not snoozed into the future).
 */
export function isReminderDue(reminder: ReminderItem, now: Date = new Date()): boolean {
  if (reminder.completed) return false;

  const nowMs = now.getTime();

  if (reminder.snoozedUntil) {
    const snoozeMs = new Date(reminder.snoozedUntil).getTime();
    return snoozeMs <= nowMs;
  }

  const schedMs = new Date(reminder.scheduledTime).getTime();
  return schedMs <= nowMs;
}

/**
 * Sorts reminders: active/due first, then by priority (High > Medium > Low), then by time.
 */
export function sortReminders(reminders: ReminderItem[]): ReminderItem[] {
  const priorityWeight: Record<ReminderPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return [...reminders].sort((a, b) => {
    // Incompleted before completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // High priority before Low
    const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (pDiff !== 0) return pDiff;

    // Earlier time first
    const timeA = new Date(a.snoozedUntil || a.scheduledTime).getTime();
    const timeB = new Date(b.snoozedUntil || b.scheduledTime).getTime();
    return timeA - timeB;
  });
}

/**
 * Dynamic chatty nudge messages bank for 30-minute interval checks.
 * Gentle notification, not an alarm, friendly and caring.
 */
export const CHATTY_NUDGES = [
  "Hey! Quick check-in: are you still working on this task? Completed?",
  "How's that current task going? Still in the zone, or ready to tick it off?",
  "Friendly nudge: Did you finish that task? Remember to stay hydrated!",
  "30-minute pulse check! Still making progress or need to switch focus?",
  "Hey there! Just checking on your day's flow. Need to log your last hour?",
  "You've been focused! Are you ready to mark your task done?",
];

export function getRandomChattyNudge(taskTitle?: string): string {
  if (taskTitle) {
    return `Hey! Are you still working on "${taskTitle}"? Completed or still in progress?`;
  }
  const idx = Math.floor(Math.random() * CHATTY_NUDGES.length);
  return CHATTY_NUDGES[idx];
}
