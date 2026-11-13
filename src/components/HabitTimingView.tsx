import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Clock,
  Play,
  Square,
  CheckCircle2,
  Calendar,
  Trash2,
  Check,
  TrendingUp,
} from 'lucide-react';
import { HabitTimingItem, TimeCategory } from '../types';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '../utils/timeframeCalculations';
import { playGentleChime, triggerHaptic } from '../utils/notifications';

interface HabitTimingViewProps {
  habits: HabitTimingItem[];
  onAddHabit: (habit: Omit<HabitTimingItem, 'id' | 'createdAt' | 'logs'>) => void;
  onLogTiming: (habitId: string, dateKey: string, start: string, end: string, notes?: string) => void;
  onDeleteHabit: (id: string) => void;
  dateKey: string;
}

export const HabitTimingView: React.FC<HabitTimingViewProps> = ({
  habits,
  onAddHabit,
  onLogTiming,
  onDeleteHabit,
  dateKey,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TimeCategory>('Productive');
  const [targetStart, setTargetStart] = useState('07:00');
  const [targetEnd, setTargetEnd] = useState('07:45');

  // Active stopwatch timers { [habitId]: startTime }
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});

  // Manual logging modal
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  const [manualStart, setManualStart] = useState('07:00');
  const [manualEnd, setManualEnd] = useState('07:45');
  const [manualNotes, setManualNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title: title.trim(),
      category,
      targetStartTime: targetStart,
      targetEndTime: targetEnd,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    setTitle('');
    setIsAdding(false);
  };

  const handleStartTimer = (habitId: string) => {
    setActiveTimers(prev => ({ ...prev, [habitId]: Date.now() }));
    triggerHaptic([40]);
  };

  const handleStopTimer = (habitId: string) => {
    const started = activeTimers[habitId];
    if (!started) return;

    const startDate = new Date(started);
    const endDate = new Date();

    const startStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    onLogTiming(habitId, dateKey, startStr, endStr, 'Logged via live stopwatch');
    playGentleChime('complete');
    triggerHaptic([60, 40]);

    setActiveTimers(prev => {
      const copy = { ...prev };
      delete copy[habitId];
      return copy;
    });
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingHabitId) return;

    onLogTiming(loggingHabitId, dateKey, manualStart, manualEnd, manualNotes.trim() || undefined);
    playGentleChime('complete');
    triggerHaptic([60, 40]);
    setLoggingHabitId(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Intro Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Daily Habit Timing Tracker
            </h2>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Track Habit Timing</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Track the exact timeframe when specific recurring tasks are done everyday. Monitor your target vs. actual execution consistency.
        </p>
      </div>

      {/* Add Habit Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">
              New Routine / Habit Timing
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Habit / Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning 5km Run, Meditation, Deep Work Session"
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TimeCategory)}
                className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Start
              </label>
              <input
                type="time"
                value={targetStart}
                onChange={e => setTargetStart(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target End
              </label>
              <input
                type="time"
                value={targetEnd}
                onChange={e => setTargetEnd(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition"
          >
            Save Habit Tracker
          </button>
        </form>
      )}

      {/* Manual Timeframe Entry Modal */}
      {loggingHabitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleManualSave}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                Log Exact Timing for Today
              </h3>
              <button
                type="button"
                onClick={() => setLoggingHabitId(null)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Actual Start
                </label>
                <input
                  type="time"
                  value={manualStart}
                  onChange={e => setManualStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Actual End
                </label>
                <input
                  type="time"
                  value={manualEnd}
                  onChange={e => setManualEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                placeholder="e.g. Ran at 5:30 pace, felt strong"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs active:scale-95 transition"
            >
              Record Today's Timing
            </button>
          </form>
        </div>
      )}

      {/* Habit Cards */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <Flame className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No habit timings added</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your everyday routines to track exactly what hour and minute they are performed.
            </p>
          </div>
        ) : (
          habits.map(habit => {
            const todayLog = habit.logs[dateKey];
            const isRunning = !!activeTimers[habit.id];
            const catStyle = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS['Productive'];

            // Count streak of completed logs
            const totalLoggedDays = Object.values(habit.logs).filter(l => l.completed).length;

            return (
              <div
                key={habit.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {habit.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <Flame className="w-3 h-3" />
                        {totalLoggedDays} days completed
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{habit.title}</h4>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                      <span>Target Timeframe:</span>
                      <span className="text-slate-200">
                        {habit.targetStartTime} – {habit.targetEndTime}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Today's Timing Log Status */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 flex items-center justify-between flex-wrap gap-2">
                  {todayLog ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs text-slate-200 font-mono font-bold">
                          Done: {todayLog.actualStartTime} – {todayLog.actualEndTime}
                        </div>
                        {todayLog.notes && (
                          <div className="text-[11px] text-slate-400">{todayLog.notes}</div>
                        )}
                      </div>
                    </div>
                  ) : isRunning ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono animate-pulse">
                      <Clock className="w-4 h-4" />
                      <span>Tracking active now...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Not yet logged for today ({dateKey})
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <button
                        onClick={() => handleStopTimer(habit.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition active:scale-95"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop & Save</span>
                      </button>
                    ) : !todayLog ? (
                      <>
                        <button
                          onClick={() => handleStartTimer(habit.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition active:scale-95"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Start</span>
                        </button>
                        <button
                          onClick={() => {
                            setLoggingHabitId(habit.id);
                            setManualStart(habit.targetStartTime);
                            setManualEnd(habit.targetEndTime);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition active:scale-95"
                        >
                          Log Time
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setLoggingHabitId(habit.id);
                          setManualStart(todayLog.actualStartTime);
                          setManualEnd(todayLog.actualEndTime);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200 underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
