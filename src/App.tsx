import React, { useState, useEffect } from 'react';
import { DailyTask, HourSlot, ReminderItem, HabitTimingItem, DayArchive, NudgeSettings, TimeCategory } from './types';
import { Storage, getTodayKey, initializeSeedData } from './utils/storage';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DailyView } from './components/DailyView';
import { TimeframeView } from './components/TimeframeView';
import { RemindersView } from './components/RemindersView';
import { HabitTimingView } from './components/HabitTimingView';
import { AnalyticsView } from './components/AnalyticsView';
import { NudgeModal } from './components/NudgeModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import {
  playGentleChime,
  triggerHaptic,
  requestNotificationPermission,
  sendSystemNotification,
} from './utils/notifications';
import { isReminderDue, getRandomChattyNudge } from './utils/reminderEngine';

export default function App() {
  const [todayKey, setTodayKey] = useState<string>(getTodayKey());
  const [activeTab, setActiveTab] = useState<NavTab>('daily');

  // Core Data State
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [slots, setSlots] = useState<Record<number, HourSlot>>({});
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [habits, setHabits] = useState<HabitTimingItem[]>([]);
  const [archives, setArchives] = useState<Record<string, DayArchive>>({});
  const [nudgeSettings, setNudgeSettings] = useState<NudgeSettings>(Storage.getNudgeSettings());

  // Interactive Modals
  const [showAndroidExport, setShowAndroidExport] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [nudgeTaskTitle, setNudgeTaskTitle] = useState<string | undefined>(undefined);
  const [showMorningPrompt, setShowMorningPrompt] = useState(false);

  // Active in-app reminder alert toast
  const [activeAlertReminder, setActiveAlertReminder] = useState<ReminderItem | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // 1. Initial Load & Seed
  useEffect(() => {
    initializeSeedData();

    const loadedTasks = Storage.getTasks();
    const loadedSlots = Storage.getDayTimeframe(todayKey);
    const loadedReminders = Storage.getReminders();
    const loadedHabits = Storage.getHabits();
    const loadedArchives = Storage.getArchives();
    const loadedNudge = Storage.getNudgeSettings();

    setTasks(loadedTasks);
    setSlots(loadedSlots);
    setReminders(loadedReminders);
    setHabits(loadedHabits);
    setArchives(loadedArchives);
    setNudgeSettings(loadedNudge);

    // Morning prompt: check if prompted today
    const lastPromptDate = Storage.getLastMorningPrompt();
    if (lastPromptDate !== todayKey) {
      setShowMorningPrompt(true);
    }

    // PWA install listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Request notification permission smoothly
    requestNotificationPermission();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [todayKey]);

  // Sync archive whenever tasks or slots change for today
  useEffect(() => {
    if (tasks.length > 0 || Object.keys(slots).length > 0) {
      Storage.saveDayArchive(todayKey, tasks, slots);
      setArchives(Storage.getArchives());
    }
  }, [tasks, slots, todayKey]);

  // 2. Dynamic 30-Minute Nudge Background Interval Loop
  useEffect(() => {
    if (!nudgeSettings.enabled) return;

    const intervalMs = (nudgeSettings.intervalMinutes || 30) * 60 * 1000;
    const intervalTimer = setInterval(() => {
      triggerChattyNudge();
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [nudgeSettings, tasks]);

  // 3. Live Reminder Schedule Watcher (Checks every 15 seconds)
  useEffect(() => {
    const watcher = setInterval(() => {
      const now = new Date();
      for (const rem of reminders) {
        if (isReminderDue(rem, now)) {
          // Trigger reminder alert
          setActiveAlertReminder(rem);
          if (nudgeSettings.soundEnabled) {
            playGentleChime('reminder');
          }
          triggerHaptic([100, 50, 100, 50, 200]);
          sendSystemNotification(`Reminder: ${rem.title}`, {
            body: rem.description || `Priority: ${rem.priority} · Type: ${rem.type}`,
          });
          break;
        }
      }
    }, 15000);

    return () => clearInterval(watcher);
  }, [reminders, nudgeSettings]);

  const triggerChattyNudge = () => {
    const pendingTasks = tasks.filter(t => t.date === todayKey && !t.completed);
    const targetTask = pendingTasks.length > 0 ? pendingTasks[0].title : undefined;

    setNudgeTaskTitle(targetTask);
    setShowNudgeModal(true);

    if (nudgeSettings.soundEnabled) {
      playGentleChime('nudge');
    }
    triggerHaptic([80, 50, 80]);

    sendSystemNotification('Piku Check-in 👋', {
      body: getRandomChattyNudge(targetTask),
    });
  };

  // Task Actions
  const handleAddTask = (newTaskData: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    Storage.saveTasks(updated);
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
    Storage.saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    Storage.saveTasks(updated);
  };

  // Timeframe Actions
  const handleUpdateSlot = (hour: number, category: TimeCategory, activity: string) => {
    const updated = {
      ...slots,
      [hour]: {
        hour,
        category,
        activity,
        updatedAt: new Date().toISOString(),
      },
    };
    setSlots(updated);
    Storage.saveDayTimeframe(todayKey, updated);
  };

  const handleUpdateRange = (
    startHour: number,
    endHour: number,
    category: TimeCategory,
    activity: string
  ) => {
    const updated = { ...slots };
    const minH = Math.min(startHour, endHour);
    const maxH = Math.max(startHour, endHour);

    for (let h = minH; h <= maxH; h++) {
      updated[h] = {
        hour: h,
        category,
        activity,
        updatedAt: new Date().toISOString(),
      };
    }
    setSlots(updated);
    Storage.saveDayTimeframe(todayKey, updated);
  };

  // Reminder Actions
  const handleAddReminder = (newRemData: Omit<ReminderItem, 'id' | 'createdAt'>) => {
    const newRem: ReminderItem = {
      ...newRemData,
      id: 'rem-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newRem, ...reminders];
    setReminders(updated);
    Storage.saveReminders(updated);
  };

  const handleUpdateReminder = (updatedRem: ReminderItem) => {
    const updated = reminders.map(r => (r.id === updatedRem.id ? updatedRem : r));
    setReminders(updated);
    Storage.saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    Storage.saveReminders(updated);
  };

  // Habit Actions
  const handleAddHabit = (newHabitData: Omit<HabitTimingItem, 'id' | 'createdAt' | 'logs'>) => {
    const newHabit: HabitTimingItem = {
      ...newHabitData,
      id: 'habit-' + Date.now(),
      logs: {},
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleLogTiming = (
    habitId: string,
    dateKey: string,
    start: string,
    end: string,
    notes?: string
  ) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          logs: {
            ...h.logs,
            [dateKey]: {
              actualStartTime: start,
              actualEndTime: end,
              completed: true,
              notes,
            },
          },
        };
      }
      return h;
    });
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  // PWA Install trigger
  const handleInstallApp = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const handleDismissMorningPrompt = () => {
    setShowMorningPrompt(false);
    Storage.setLastMorningPrompt(todayKey);
  };

  // Active Pending Reminders Count
  const now = new Date();
  const pendingRemindersCount = reminders.filter(r => !r.completed && isReminderDue(r, now)).length;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Mobile Bar */}
      <Header
        currentDateStr={formattedDate}
        nudgeSettings={nudgeSettings}
        onUpdateNudgeSettings={settings => {
          setNudgeSettings(settings);
          Storage.saveNudgeSettings(settings);
        }}
        onOpenAndroidExport={() => setShowAndroidExport(true)}
        onTriggerTestNudge={triggerChattyNudge}
        installPrompt={{
          isInstallable: !!deferredPrompt,
          isInstalled,
          install: handleInstallApp,
        }}
      />

      {/* In-App Live Alert Toast (When a Reminder is Due) */}
      {activeAlertReminder && (
        <div className="fixed top-16 left-4 right-4 z-40 max-w-md mx-auto rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border border-rose-500/50 p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Scheduled Reminder Due</span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mt-1">
                {activeAlertReminder.title}
              </h4>
              {activeAlertReminder.description && (
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeAlertReminder.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setActiveAlertReminder(null)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                const snoozed = new Date(Date.now() + 10 * 60000).toISOString();
                handleUpdateReminder({
                  ...activeAlertReminder,
                  snoozedUntil: snoozed,
                });
                setActiveAlertReminder(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
            >
              Snooze 10m
            </button>
            <button
              onClick={() => {
                handleUpdateReminder({
                  ...activeAlertReminder,
                  completed: true,
                });
                playGentleChime('complete');
                setActiveAlertReminder(null);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-600 transition"
            >
              Mark Done
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24">
        {activeTab === 'daily' && (
          <DailyView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onTriggerTestNudge={triggerChattyNudge}
            dateKey={todayKey}
            showMorningPrompt={showMorningPrompt}
            onDismissMorningPrompt={handleDismissMorningPrompt}
          />
        )}

        {activeTab === 'timeframe' && (
          <TimeframeView
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
            onUpdateRange={handleUpdateRange}
            dateKey={todayKey}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onTriggerSimulatedReminder={rem => {
              setActiveAlertReminder(rem);
              playGentleChime('reminder');
              triggerHaptic([100, 50, 100]);
            }}
          />
        )}

        {activeTab === 'habits' && (
          <HabitTimingView
            habits={habits}
            onAddHabit={handleAddHabit}
            onLogTiming={handleLogTiming}
            onDeleteHabit={handleDeleteHabit}
            dateKey={todayKey}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView archives={archives} todayKey={todayKey} />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingRemindersCount={pendingRemindersCount}
      />

      {/* 30-Minute Dynamic Nudge Modal */}
      <NudgeModal
        isOpen={showNudgeModal}
        onClose={() => setShowNudgeModal(false)}
        taskTitle={nudgeTaskTitle}
        onMarkTaskCompleted={() => {
          if (nudgeTaskTitle) {
            const found = tasks.find(t => t.title === nudgeTaskTitle && !t.completed);
            if (found) {
              handleToggleTask(found.id);
            }
          }
        }}
        onSnooze={mins => {
          // Snooze nudge
          setShowNudgeModal(false);
        }}
        onStillWorking={() => {
          setShowNudgeModal(false);
        }}
      />

      {/* Android Studio Project & APK Export Modal */}
      <AndroidExportModal
        isOpen={showAndroidExport}
        onClose={() => setShowAndroidExport(false)}
      />
    </div>
  );
}
