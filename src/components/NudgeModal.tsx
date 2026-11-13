import React from 'react';
import { Sparkles, CheckCircle2, Clock, ThumbsUp, X } from 'lucide-react';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  onMarkTaskCompleted: () => void;
  onSnooze: (minutes: number) => void;
  onStillWorking: () => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  onMarkTaskCompleted,
  onSnooze,
  onStillWorking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot / Avatar chatty gesture */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-400 p-0.5 flex-shrink-0 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl animate-bounce">👋</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Piku 30-Min Pulse
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Just a nudge</span>
            </div>
            <h3 className="font-bold text-sm text-slate-100 leading-tight mt-0.5">
              Hey! Quick check-in...
            </h3>
          </div>
        </div>

        {/* Speech Bubble / Chatty question */}
        <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {taskTitle ? (
              <>
                Are you still working on{' '}
                <span className="text-emerald-400 font-bold">"{taskTitle}"</span>?
                Completed, or still in flow?
              </>
            ) : (
              <>
                How is your focus going right now? Ready to tick off a task or take a 2-minute breath and drink water?
              </>
            )}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Regular 30-min gentle check-in</span>
          </div>
        </div>

        {/* Quick Response Actions */}
        <div className="space-y-2">
          {taskTitle && (
            <button
              onClick={() => {
                onMarkTaskCompleted();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes, Task Completed!</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onStillWorking();
                onClose();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Still working on it</span>
            </button>

            <button
              onClick={() => {
                onSnooze(15);
                onClose();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Nudge in 15m</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
