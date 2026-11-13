import { TimeCategory, HourSlot } from '../types';

export const CATEGORY_COLORS: Record<TimeCategory, {
  bg: string;
  text: string;
  border: string;
  hex: string;
  accent: string;
}> = {
  'Productive': {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    hex: '#10b981',
    accent: 'bg-emerald-500',
  },
  'Necessary': {
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    hex: '#0ea5e9',
    accent: 'bg-sky-500',
  },
  'Leisure / Rest': {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    hex: '#f59e0b',
    accent: 'bg-amber-500',
  },
  'Unproductive': {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    hex: '#f43f5e',
    accent: 'bg-rose-500',
  },
  'Unrecorded': {
    bg: 'bg-slate-800/40',
    text: 'text-slate-400',
    border: 'border-slate-800',
    hex: '#475569',
    accent: 'bg-slate-600',
  },
};

export const ALL_CATEGORIES: TimeCategory[] = [
  'Productive',
  'Necessary',
  'Leisure / Rest',
  'Unproductive',
  'Unrecorded',
];

/**
 * Creates empty default 24-hour slots for a day
 */
export function createDefaultDaySlots(): Record<number, HourSlot> {
  const slots: Record<number, HourSlot> = {};
  for (let h = 0; h < 24; h++) {
    slots[h] = {
      hour: h,
      category: 'Unrecorded',
      activity: '',
    };
  }
  return slots;
}

/**
 * Calculates total hours and percentages spent across categories.
 */
export function calculateCategoryStats(slots: Record<number, HourSlot>): {
  hoursByCategory: Record<TimeCategory, number>;
  percentageByCategory: Record<TimeCategory, number>;
  recordedHours: number;
  unrecordedHours: number;
  productiveRatio: number; // Productive / recorded
} {
  const hoursByCategory: Record<TimeCategory, number> = {
    'Productive': 0,
    'Necessary': 0,
    'Leisure / Rest': 0,
    'Unproductive': 0,
    'Unrecorded': 0,
  };

  const slotValues = Object.values(slots || {});
  for (const slot of slotValues) {
    const cat = slot.category || 'Unrecorded';
    hoursByCategory[cat] = (hoursByCategory[cat] || 0) + 1;
  }

  const totalSlots = 24;
  const recordedHours = totalSlots - (hoursByCategory['Unrecorded'] || 0);
  const unrecordedHours = hoursByCategory['Unrecorded'] || 0;

  const percentageByCategory: Record<TimeCategory, number> = {
    'Productive': Math.round((hoursByCategory['Productive'] / totalSlots) * 100),
    'Necessary': Math.round((hoursByCategory['Necessary'] / totalSlots) * 100),
    'Leisure / Rest': Math.round((hoursByCategory['Leisure / Rest'] / totalSlots) * 100),
    'Unproductive': Math.round((hoursByCategory['Unproductive'] / totalSlots) * 100),
    'Unrecorded': Math.round((hoursByCategory['Unrecorded'] / totalSlots) * 100),
  };

  const productiveRatio = recordedHours > 0
    ? Math.round((hoursByCategory['Productive'] / recordedHours) * 100)
    : 0;

  return {
    hoursByCategory,
    percentageByCategory,
    recordedHours,
    unrecordedHours,
    productiveRatio,
  };
}

/**
 * Formats hour index to human string (e.g. 9 -> "09:00 - 10:00")
 */
export function formatHourRange(hour: number): string {
  const start = String(hour).padStart(2, '0') + ':00';
  const nextHour = (hour + 1) % 24;
  const end = String(nextHour).padStart(2, '0') + ':00';
  return `${start} – ${end}`;
}
