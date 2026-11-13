import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  Calendar,
  AlertCircle,
  Sun,
  ChevronRight,
} from 'lucide-react';
import { DailyTask, TimeCategory } from '../types';
import { calculateCompletionRate, getRemainingDayTime } from '../utils/taskCalculations';
import { CATEGORY_COLORS, ALL_CATEGORIES } from '../utils/timeframeCalculations';
import confetti from 'canvas-confetti';
import { playGentleChime, triggerHaptic } from '../utils/notifications';

interface DailyViewProps {
  tasks: DailyTask[];
  onAddTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTriggerTestNudge: () => void;
  dateKey: string;
  showMorningPrompt: boolean;
  onDismissMorningPrompt: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onTriggerTestNudge,
  dateKey,
  showMorningPrompt,
  onDismissMorningPrompt,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TimeCategory>('Productive');
  const [newMinutes, setNewMinutes] = useState(45);
  const [newNotes, setNewNotes] = useState('');

  const todayTasks = tasks.filter(t => t.date === dateKey);
  const completedTasks = todayTasks.filter(t => t.completed);
  const remainingTasks = todayTasks.filter(t => !t.completed);
  const completionRate = calculateCompletionRate(todayTasks);
  const remainingDay = getRemainingDayTime();

  const filteredTasks = todayTasks.filter(task => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Pending') return !task.completed;
    if (filterCategory === 'Completed') return task.completed;
    return task.category === filterCategory;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      estimatedMinutes: Number(newMinutes) || 30,
      completed: false,
      date: dateKey,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setIsAddingTask(false);
  };

  const handleTaskToggle = (id: string, isNowCompleted: boolean) => {
    onToggleTask(id);
    if (isNowCompleted) {
      playGentleChime('complete');
      triggerHaptic([60, 40, 100]);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#38bdf8', '#f59e0b'],
      });
    } else {
      triggerHaptic([50]);
    }
  };

  // 24-hour circle SVG parameters
  const circleSize = 220;
  const strokeWidth = 16;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="space-y-4 pb-20">
      {/* Morning Notification Prompt Banner */}
      {showMorningPrompt && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/20 border border-amber-500/30 p-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-200">
                  Good Morning! Plan Today's Day
                </h3>
                <button
                  onClick={onDismissMorningPrompt}
                  className="text-xs text-slate-400 hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Piku sends this morning reminder to list your whole day's tasks. What are your key milestones for the 24-hour cycle?
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAddingTask(true);
                    onDismissMorningPrompt();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Task</span>
                </button>
                <button
                  onClick={onDismissMorningPrompt}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The 24-Hour Circle Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              24-Hour Daily Circle
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
            {remainingDay.hours}h {remainingDay.minutes}m remaining
          </span>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
          <div className="relative flex items-center justify-center">
            <svg width={circleSize} height={circleSize} className="transform -rotate-90">
              {/* Background Track */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Gradient Progress Arc */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="url(#circleGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {completionRate}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                Completed
              </span>
              <span className="text-[10px] text-emerald-400/90 font-mono mt-1">
                {completedTasks.length} of {todayTasks.length} tasks
              </span>
            </div>
          </div>

          {/* Circle Legend & Stats */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[150px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300">Completed</span>
              </div>
              <span className="font-bold text-sm text-emerald-400 font-mono">
                {completedTasks.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">Remaining</span>
              </div>
              <span className="font-bold text-sm text-amber-400 font-mono">
                {remainingTasks.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-xs text-slate-300">Total Planned</span>
              </div>
              <span className="font-bold text-sm text-sky-400 font-mono">
                {todayTasks.length}
              </span>
            </div>
          </div>
        </div>

        {/* 30-min Dynamic Nudge Quick Action Banner */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>30-min chatty reminder active</span>
          </div>
          <button
            onClick={onTriggerTestNudge}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 active:scale-95 transition"
          >
            <span>Ask me now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Creation Header & Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="font-bold text-base text-slate-100">Today's Tasks</h3>
          <p className="text-xs text-slate-400">
            {remainingTasks.length} pending · {completedTasks.length} completed
          </p>
        </div>

        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add Task Modal / Collapse Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200">New Daily Task</h4>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Finish Sprint Review & Slides"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as TimeCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                Estimated Time
              </label>
              <select
                value={newMinutes}
                onChange={e => setNewMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Notes / Sub-bullets (Optional)
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="e.g. Include metrics chart, share link with team"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition"
          >
            Save Task to 24-Hour List
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {['All', 'Pending', 'Completed', 'Productive', 'Necessary', 'Leisure / Rest', 'Unproductive'].map(
          tab => {
            const isActive = filterCategory === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterCategory(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-200 text-slate-950 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800/60 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          }
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No tasks in this view</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your planned tasks to track today's 24-hour completion rate.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Productive'];

            return (
              <div
                key={task.id}
                className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/90 border-slate-800 shadow-md hover:border-slate-700'
                }`}
              >
                {/* 1-Tap Toggle Circle */}
                <button
                  onClick={() => handleTaskToggle(task.id, !task.completed)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition active:scale-90"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium leading-tight ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                    {/* Category Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {task.category}
                    </span>

                    {/* Time estimate */}
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {task.estimatedMinutes}m
                    </span>

                    {task.completed && task.completedAt && (
                      <span className="text-emerald-400/80 font-mono text-[10px]">
                        ✓ Completed {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Action */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="opacity-60 hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
