import React from 'react';
import { Bell, Sparkles, Download, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { NudgeSettings } from '../types';

interface HeaderProps {
  currentDateStr: string;
  nudgeSettings: NudgeSettings;
  onUpdateNudgeSettings: (settings: NudgeSettings) => void;
  onOpenAndroidExport: () => void;
  onTriggerTestNudge: () => void;
  installPrompt: {
    isInstallable: boolean;
    isInstalled: boolean;
    install: () => Promise<boolean>;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  nudgeSettings,
  onUpdateNudgeSettings,
  onOpenAndroidExport,
  onTriggerTestNudge,
  installPrompt,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 pt-safe">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-base tracking-tighter bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                P
              </span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-slate-100 tracking-tight leading-none">
                Piku
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
              {currentDateStr}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              onUpdateNudgeSettings({
                ...nudgeSettings,
                soundEnabled: !nudgeSettings.soundEnabled,
              });
            }}
            aria-label={nudgeSettings.soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition active:scale-95"
            title={nudgeSettings.soundEnabled ? 'Chime sound is ON' : 'Chime sound is OFF'}
          >
            {nudgeSettings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Test 30m Nudge Trigger */}
          <button
            onClick={onTriggerTestNudge}
            aria-label="Test 30m chatty nudge"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition active:scale-95"
            title="Trigger 30-min chatty check-in now"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* PWA Install Button (if available) */}
          {installPrompt.isInstallable && !installPrompt.isInstalled && (
            <button
              onClick={installPrompt.install}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition active:scale-95 shadow-md shadow-emerald-500/20"
              title="Install Piku as Native App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Android Studio & APK Export */}
          <button
            onClick={onOpenAndroidExport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 font-medium text-xs transition active:scale-95"
            title="Android Studio Source & APK Guide"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
