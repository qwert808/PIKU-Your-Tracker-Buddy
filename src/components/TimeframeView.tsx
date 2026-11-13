import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Layers,
  Check,
  Edit2,
  PieChart,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { HourSlot, TimeCategory } from '../types';
import {
  CATEGORY_COLORS,
  ALL_CATEGORIES,
  calculateCategoryStats,
  formatHourRange,
} from '../utils/timeframeCalculations';
import { triggerHaptic } from '../utils/notifications';

interface TimeframeViewProps {
  slots: Record<number, HourSlot>;
  onUpdateSlot: (hour: number, category: TimeCategory, activity: string) => void;
  onUpdateRange: (startHour: number, endHour: number, category: TimeCategory, activity: string) => void;
  dateKey: string;
}

export const TimeframeView: React.FC<TimeframeViewProps> = ({
  slots,
  onUpdateSlot,
  onUpdateRange,
  dateKey,
}) => {
  const currentHour = new Date().getHours();
  const pastHour = (currentHour + 23) % 24;

  const [editingHour, setEditingHour] = useState<number | null>(null);
  const [editActivity, setEditActivity] = useState('');
  const [editCategory, setEditCategory] = useState<TimeCategory>('Productive');

  // Range block state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [rangeStart, setRangeStart] = useState<number>(9);
  const [rangeEnd, setRangeEnd] = useState<number>(12);
  const [rangeCategory, setRangeCategory] = useState<TimeCategory>('Productive');
  const [rangeActivity, setRangeActivity] = useState('');

  const stats = calculateCategoryStats(slots);

  const startEditSlot = (hour: number) => {
    const slot = slots[hour] || { hour, category: 'Unrecorded', activity: '' };
    setEditingHour(hour);
    setEditCategory(slot.category);
    setEditActivity(slot.activity);
  };

  const saveSlot = (hour: number) => {
    onUpdateSlot(hour, editCategory, editActivity.trim());
    triggerHaptic([40]);
    setEditingHour(null);
  };

  const handleApplyRange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRange(rangeStart, rangeEnd, rangeCategory, rangeActivity.trim());
    triggerHaptic([60, 40]);
    setShowBlockModal(false);
    setRangeActivity('');
  };

  const quickSetCategory = (hour: number, cat: TimeCategory) => {
    const existing = slots[hour] || { hour, category: 'Unrecorded', activity: '' };
    onUpdateSlot(hour, cat, existing.activity);
    triggerHaptic([30]);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Intro Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              24-Hour Timeframe Utilization
            </h2>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 font-semibold text-xs transition active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fill Block</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Days rarely go exactly as planned. Record specifically how each hour of your 24 hours was spent with Color Codes.
        </p>

        {/* 24-Hour Continuous Visual Strip */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:59</span>
          </div>
          <div className="grid grid-cols-24 h-6 rounded-xl overflow-hidden border border-slate-800 p-0.5 bg-slate-950 gap-0.5">
            {Array.from({ length: 24 }).map((_, h) => {
              const slot = slots[h];
              const cat = slot?.category || 'Unrecorded';
              const col = CATEGORY_COLORS[cat];
              const isCurrent = h === currentHour;

              return (
                <button
                  key={h}
                  onClick={() => startEditSlot(h)}
                  className={`h-full rounded-sm transition-all relative ${col.accent} ${
                    isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950' : ''
                  }`}
                  title={`${formatHourRange(h)}: ${cat} - ${slot?.activity || 'No activity recorded'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Color Legend & Hour Count Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => {
            const style = CATEGORY_COLORS[cat];
            const hours = stats.hoursByCategory[cat] || 0;
            const pct = stats.percentageByCategory[cat] || 0;

            return (
              <div
                key={cat}
                className={`p-2.5 rounded-xl border ${style.bg} ${style.border}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.accent}`} />
                  <span className={`text-xs font-bold leading-tight ${style.text}`}>
                    {cat}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-extrabold text-slate-100 font-mono">
                    {hours}h
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {pct}% of day
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Productive Ratio Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              Productive Efficiency (Logged Time):
            </span>
          </div>
          <span className="font-bold font-mono text-emerald-400 text-sm">
            {stats.productiveRatio}%
          </span>
        </div>
      </div>

      {/* Hourly Quick Prompt: How did you spend the past hour? */}
      {slots[pastHour]?.category === 'Unrecorded' && (
        <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30 p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Piku Timeframe Nudge</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-1">
                How did you use {formatHourRange(pastHour)}?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => {
              const col = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => quickSetCategory(pastHour, cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 whitespace-nowrap ${col.bg} ${col.text} ${col.border}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Assigner Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleApplyRange}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">
                Log Timeframe Block
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Start Hour
                </label>
                <select
                  value={rangeStart}
                  onChange={e => setRangeStart(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  End Hour
                </label>
                <select
                  value={rangeEnd}
                  onChange={e => setRangeEnd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CATEGORIES.map(cat => {
                  const isSelected = rangeCategory === cat;
                  const col = CATEGORY_COLORS[cat];
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setRangeCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition ${
                        isSelected
                          ? `${col.bg} ${col.text} ${col.border} ring-2 ring-sky-500`
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Activity Details
              </label>
              <input
                type="text"
                value={rangeActivity}
                onChange={e => setRangeActivity(e.target.value)}
                placeholder="e.g. Deep coding, lunch, workout, gaming"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm active:scale-95 transition shadow-lg shadow-sky-500/20"
            >
              Apply to Hours
            </button>
          </form>
        </div>
      )}

      {/* Hour-by-Hour 24 Hours Timeline List */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-200 px-1">
          Hour-Wise Timeframe Log (24 Hours)
        </h3>

        {Array.from({ length: 24 }).map((_, hour) => {
          const slot = slots[hour] || { hour, category: 'Unrecorded', activity: '' };
          const col = CATEGORY_COLORS[slot.category] || CATEGORY_COLORS['Unrecorded'];
          const isCurrent = hour === currentHour;
          const isEditing = editingHour === hour;

          return (
            <div
              key={hour}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-sky-500/60 bg-slate-900/90 shadow-md ring-1 ring-sky-500/20'
                  : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              <div className="p-3">
                <div className="flex items-center justify-between">
                  {/* Time badge */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {formatHourRange(hour)}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px] uppercase">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <button
                    onClick={() => startEditSlot(hour)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border transition active:scale-95 flex items-center gap-1 ${col.bg} ${col.text} ${col.border}`}
                  >
                    <span>{slot.category}</span>
                    <Edit2 className="w-3 h-3 opacity-70" />
                  </button>
                </div>

                {/* Activity text or inline edit form */}
                {isEditing ? (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Category
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {ALL_CATEGORIES.map(cat => {
                          const catCol = CATEGORY_COLORS[cat];
                          const selected = editCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditCategory(cat)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                                selected
                                  ? `${catCol.bg} ${catCol.text} ${catCol.border} ring-1 ring-white`
                                  : 'bg-slate-950 border-slate-800 text-slate-400'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        What was done during this timeframe?
                      </label>
                      <input
                        type="text"
                        value={editActivity}
                        onChange={e => setEditActivity(e.target.value)}
                        placeholder="e.g. Completed documentation, sprint sync"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingHour(null)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSlot(hour)}
                        className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
                      >
                        Save Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-300 italic truncate max-w-[260px]">
                      {slot.activity ? slot.activity : 'No specific activity entered yet'}
                    </p>

                    {/* Quick 1-tap category buttons */}
                    <div className="flex items-center gap-1">
                      {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => {
                        const isThis = slot.category === cat;
                        const cCol = CATEGORY_COLORS[cat];
                        return (
                          <button
                            key={cat}
                            onClick={() => quickSetCategory(hour, cat)}
                            className={`w-4 h-4 rounded-full transition-transform ${cCol.accent} ${
                              isThis ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-100'
                            }`}
                            title={`Set to ${cat}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
