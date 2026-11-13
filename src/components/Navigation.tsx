import React from 'react';
import { CircleDot, Clock, Bell, Flame, BarChart3 } from 'lucide-react';

export type NavTab = 'daily' | 'timeframe' | 'reminders' | 'habits' | 'analytics';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRemindersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'daily', label: 'Daily', icon: CircleDot },
    { id: 'timeframe', label: 'Timeframe', icon: Clock },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {tab.id === 'reminders' && pendingRemindersCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {pendingRemindersCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
