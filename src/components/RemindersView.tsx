import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  RotateCw,
  Trash2,
  Edit2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ReminderItem, ReminderPriority, ReminderFrequency, ReminderType } from '../types';
import {
  sortReminders,
  calculateNextOccurrence,
  calculateSnoozeTime,
  isReminderDue,
} from '../utils/reminderEngine';
import { playGentleChime, triggerHaptic, sendSystemNotification } from '../utils/notifications';

interface RemindersViewProps {
  reminders: ReminderItem[];
  onAddReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  onUpdateReminder: (reminder: ReminderItem) => void;
  onDeleteReminder: (id: string) => void;
  onTriggerSimulatedReminder: (reminder: ReminderItem) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onTriggerSimulatedReminder,
}) => {
  const [filter, setFilter] = useState<'All' | 'Due' | 'High' | 'Completed'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReminderType>('Meeting');
  const [priority, setPriority] = useState<ReminderPriority>('High');
  const [frequency, setFrequency] = useState<ReminderFrequency>('Daily');
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });

  const sorted = sortReminders(reminders);
  const now = new Date();

  const filteredReminders = sorted.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return r.completed;
    if (filter === 'High') return !r.completed && r.priority === 'High';
    if (filter === 'Due') return !r.completed && isReminderDue(r, now);
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      const existing = reminders.find(r => r.id === editingId);
      if (existing) {
        onUpdateReminder({
          ...existing,
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          priority,
          frequency,
          scheduledTime: new Date(scheduledDateTime).toISOString(),
        });
      }
      setEditingId(null);
    } else {
      onAddReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        frequency,
        scheduledTime: new Date(scheduledDateTime).toISOString(),
        completed: false,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('Meeting');
    setPriority('High');
    setFrequency('Daily');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (reminder: ReminderItem) => {
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setType(reminder.type);
    setPriority(reminder.priority);
    setFrequency(reminder.frequency);
    setScheduledDateTime(new Date(reminder.scheduledTime).toISOString().slice(0, 16));
    setEditingId(reminder.id);
    setIsAdding(true);
  };

  const handleComplete = (reminder: ReminderItem) => {
    if (reminder.frequency !== 'None') {
      // Calculate next recurring occurrence
      const nextDate = calculateNextOccurrence(new Date(reminder.scheduledTime), reminder.frequency);
      onUpdateReminder({
        ...reminder,
        scheduledTime: nextDate.toISOString(),
        snoozedUntil: undefined,
        completed: false,
      });
      playGentleChime('complete');
      triggerHaptic([60, 40]);
    } else {
      onUpdateReminder({
        ...reminder,
        completed: true,
        snoozedUntil: undefined,
      });
      playGentleChime('complete');
      triggerHaptic([60, 40]);
    }
  };

  const handleSnooze = (reminder: ReminderItem, minutes: number) => {
    const snoozedTime = calculateSnoozeTime(minutes);
    onUpdateReminder({
      ...reminder,
      snoozedUntil: snoozedTime,
    });
    triggerHaptic([40]);
  };

  const getPriorityBadge = (p: ReminderPriority) => {
    switch (p) {
      case 'High':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Intro & CTA Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Personal Reminders & Events
            </h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition active:scale-95 shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Never miss appointments, client meetings, or critical deadlines. Operates locally with exact scheduling and snooze options.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar">
          {(['All', 'Due', 'High', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === tab
                  ? 'bg-slate-200 text-slate-950 font-semibold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'Due' ? 'Due / Upcoming' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">
              {editingId ? 'Edit Reminder' : 'Create Personal Reminder'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Title / Commitment
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Board Meeting"
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ReminderType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Appointment">Appointment</option>
                <option value="Meeting">Meeting</option>
                <option value="Deadline">Deadline</option>
                <option value="Event">Event</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ReminderPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={e => setScheduledDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Repeat Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as ReminderFrequency)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="None">Does not repeat</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description / Location / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Bring presentation slides and doctor report"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-98 transition"
          >
            {editingId ? 'Update Reminder' : 'Save Reminder Schedule'}
          </button>
        </form>
      )}

      {/* Reminder Cards */}
      <div className="space-y-2.5">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">No reminders found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add appointments, deadlines, and meetings with custom alerts.
            </p>
          </div>
        ) : (
          filteredReminders.map(reminder => {
            const isDue = isReminderDue(reminder, now);
            const formattedTime = new Date(reminder.scheduledTime).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={reminder.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  reminder.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : isDue
                    ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/50 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-900/90 border-slate-800 shadow-sm hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getPriorityBadge(
                          reminder.priority
                        )}`}
                      >
                        {reminder.priority}
                      </span>

                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {reminder.type}
                      </span>

                      {reminder.frequency !== 'None' && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          <RotateCw className="w-2.5 h-2.5" />
                          {reminder.frequency}
                        </span>
                      )}

                      {isDue && !reminder.completed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Due Now
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold leading-snug ${
                        reminder.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {reminder.title}
                    </h4>

                    {reminder.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {reminder.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formattedTime}
                      </span>

                      {reminder.snoozedUntil && (
                        <span className="text-amber-400 text-[11px]">
                          Snoozed till {new Date(reminder.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top quick actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTriggerSimulatedReminder(reminder)}
                      title="Test live alarm notification"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition active:scale-90"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(reminder)}
                      title="Edit reminder"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition active:scale-90"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      title="Delete reminder"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                {!reminder.completed && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Snooze:
                      </span>
                      <button
                        onClick={() => handleSnooze(reminder, 5)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition"
                      >
                        +5m
                      </button>
                      <button
                        onClick={() => handleSnooze(reminder, 10)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition"
                      >
                        +10m
                      </button>
                      <button
                        onClick={() => handleSnooze(reminder, 30)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] transition"
                      >
                        +30m
                      </button>
                    </div>

                    <button
                      onClick={() => handleComplete(reminder)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{reminder.frequency !== 'None' ? 'Next Cycle' : 'Completed'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
