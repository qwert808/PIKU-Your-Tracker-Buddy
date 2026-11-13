import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Cpu,
  BatteryCharging,
  HardDrive,
  ExternalLink,
  Code2,
  FileText,
  X,
} from 'lucide-react';
import {
  downloadAndroidProjectZip,
  ANDROID_PROJECT_FILES,
} from '../utils/androidProjectGenerator';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">
                  Native Android Studio Project & APK Builder
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                  Room + WorkManager
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete, battery-optimized Android project ready to open & build in Android Studio.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Performance & Efficiency Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <BatteryCharging className="w-4 h-4" />
                <span className="text-xs font-bold">Ultra Battery Efficient</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Uses AlarmManager exact alarms & WorkManager. No continuous wakelocks or idle drain.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-bold">100% Offline SQLite</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Zero network calls. Ultra-fast local queries via AndroidX Room Database.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold">Budget Phone Tuned</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Minified R8/Proguard rules, tiny memory footprint (&lt; 25MB RAM).
              </p>
            </div>
          </div>

          {/* Download Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-emerald-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-indigo-200">
                Download Complete Project ZIP
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Includes all Gradle scripts, AndroidManifest.xml, Room Entities, AlarmReceivers & BootReceiver.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Packaging ZIP...' : 'Download Project ZIP'}</span>
            </button>
          </div>

          {/* Quick CLI Build Guide */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                2-Minute APK Build Command (Terminal)
              </span>
              <button
                onClick={() =>
                  handleCopyCode(
                    'git clone <repo> && cd Piku && ./gradlew assembleDebug'
                  )
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
              <code>{`# Build installable debug APK directly:
./gradlew assembleDebug

# Output APK path:
app/build/outputs/apk/debug/app-debug.apk`}</code>
            </pre>
          </div>

          {/* File Explorer for Native Code */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">
                  Inspect Native Project Files
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(currentFile.content)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy File</span>
              </button>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-1 p-1.5 overflow-x-auto no-scrollbar bg-slate-900/60 border-b border-slate-800 text-xs">
              {ANDROID_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap transition ${
                    selectedFileIdx === idx
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {file.path.split('/').pop()}
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed bg-slate-950/80">
              <pre>
                <code>{currentFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Target SDK 34 · Android 14+ compatible · Offline-Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
