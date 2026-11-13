import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  RotateCcw,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { DayArchive } from '../types';
import {
  computeWeeklySummary,
  computeYearlyMonthBreakdown,
  MONTH_NAMES,
} from '../utils/taskCalculations';
import { CATEGORY_COLORS, ALL_CATEGORIES } from '../utils/timeframeCalculations';

interface AnalyticsViewProps {
  archives: Record<string, DayArchive>;
  todayKey: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ archives, todayKey }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Extract last 7 days for weekly report
  const past7DaysKeys: string[] = [];
  const baseDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    past7DaysKeys.push(`${y}-${m}-${day}`);
  }

  const weeklyData = past7DaysKeys.map(dateStr => {
    const rec = archives[dateStr];
    const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString([], { weekday: 'short' });
    return {
      date: dateStr,
      dayLabel,
      completionPercentage: rec ? rec.completionPercentage : 0,
      totalTasks: rec ? rec.totalTasks : 0,
      completedTasks: rec ? rec.completedTasks : 0,
    };
  });

  const weeklySummary = computeWeeklySummary(weeklyData);

  // Month-by-month yearly breakdown (January - December)
  const yearlyMonths = computeYearlyMonthBreakdown(selectedYear, archives);

  // Current Month stats
  const currentMonthIdx = new Date().getMonth();
  const currentMonthData = yearlyMonths[currentMonthIdx];

  // Aggregate timeframe category hours across all recorded archives
  const totalCategoryHours = {
    'Productive': 0,
    'Necessary': 0,
    'Leisure / Rest': 0,
    'Unproductive': 0,
    'Unrecorded': 0,
  };

  Object.values(archives).forEach(arc => {
    if (arc.categoryHours) {
      ALL_CATEGORIES.forEach(cat => {
        totalCategoryHours[cat] += arc.categoryHours[cat] || 0;
      });
    }
  });

  const totalLoggedHours =
    totalCategoryHours['Productive'] +
    totalCategoryHours['Necessary'] +
    totalCategoryHours['Leisure / Rest'] +
    totalCategoryHours['Unproductive'];

  return (
    <div className="space-y-4 pb-20">
      {/* Intro Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Completion Reports & Analytics
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Year {selectedYear}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Daily percentage completions are tracked, compiled into weekly reports, and consolidated into 12-month January–December progress cycles.
        </p>
      </div>

      {/* 1. Weekly Report Section */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              Weekly Task Report
            </h3>
            <p className="text-xs text-slate-400">
              Last 7 days completion percentages
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {weeklySummary.averageCompletion}%
            </span>
            <span className="block text-[10px] text-slate-400 uppercase">
              Weekly Avg
            </span>
          </div>
        </div>

        {/* Weekly Bar Graph */}
        <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36">
          {weeklyData.map(item => {
            const isToday = item.date === todayKey;
            const heightPercent = Math.max(8, item.completionPercentage);

            return (
              <div key={item.date} className="flex flex-col items-center h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-slate-300 mb-1">
                  {item.completionPercentage}%
                </span>
                <div className="w-full max-w-[28px] bg-slate-950 rounded-t-lg overflow-hidden h-24 flex items-end p-0.5 border border-slate-800">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-[4px] transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-500 to-sky-400'
                        : item.completionPercentage >= 75
                        ? 'bg-emerald-500'
                        : item.completionPercentage >= 50
                        ? 'bg-sky-500'
                        : item.completionPercentage > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-bold ${
                    isToday ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Weekly Rollover Note */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Weekly archives roll over seamlessly into monthly completion summaries.</span>
          {weeklySummary.bestDay && (
            <span className="text-emerald-400 font-semibold font-mono">
              Best Day: {weeklySummary.bestDay.slice(5)}
            </span>
          )}
        </div>
      </div>

      {/* 2. Monthly Summary Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              {currentMonthData.monthName} Completion
            </h3>
            <p className="text-xs text-slate-400">
              Current Month Aggregated Performance
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-sky-400 font-mono">
              {currentMonthData.averageRate}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-3">
          <div
            style={{ width: `${currentMonthData.averageRate}%` }}
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">
              Days Logged
            </span>
            <span className="text-base font-bold text-slate-100 font-mono">
              {currentMonthData.totalDaysLogged} days
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">
              Completed Tasks
            </span>
            <span className="text-base font-bold text-slate-100 font-mono">
              {currentMonthData.totalCompletedTasks} tasks
            </span>
          </div>
        </div>
      </div>

      {/* 3. Year-Long Matrix (January - December) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              January – December Year Progress
            </h3>
            <p className="text-xs text-slate-400">
              Full 12-month completion cycle till December
            </p>
          </div>
          <Calendar className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {yearlyMonths.map((m, idx) => {
            const isCurrentMonth = idx === currentMonthIdx;

            return (
              <div
                key={m.monthKey}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrentMonth
                    ? 'bg-slate-800/80 border-sky-500/50 shadow-md ring-1 ring-sky-500/20'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">
                    {m.monthName.slice(0, 3)}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {m.averageRate}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                  <div
                    style={{ width: `${m.averageRate}%` }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{m.totalDaysLogged}d logged</span>
                  <span>{m.totalCompletedTasks} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Time Utilization by Color Code */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Total Time Utilization Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {totalLoggedHours}h total recorded
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Cumulative hours logged across all 4 categories:
        </p>

        {/* Stacked Percentage Bar */}
        {totalLoggedHours > 0 && (
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-950 p-0.5 border border-slate-800">
            {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => {
              const hours = totalCategoryHours[cat] || 0;
              const pct = (hours / totalLoggedHours) * 100;
              if (pct <= 0) return null;
              const col = CATEGORY_COLORS[cat];

              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${col.accent}`}
                  title={`${cat}: ${hours}h (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          {ALL_CATEGORIES.filter(c => c !== 'Unrecorded').map(cat => {
            const style = CATEGORY_COLORS[cat];
            const hours = totalCategoryHours[cat] || 0;
            const pct =
              totalLoggedHours > 0 ? Math.round((hours / totalLoggedHours) * 100) : 0;

            return (
              <div
                key={cat}
                className={`p-3 rounded-2xl border ${style.bg} ${style.border}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.accent}`} />
                  <span className={`text-xs font-bold ${style.text}`}>{cat}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-100 font-mono">
                    {hours} hrs
                  </span>
                  <span className="text-xs font-mono text-slate-400">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
