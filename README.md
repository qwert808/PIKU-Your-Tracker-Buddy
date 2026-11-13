# Piku — Mobile Task, Timeframe & Reminder Tracker

An ultra-lightweight, offline-first mobile task completion, 24-hour timeframe utilization, habit timing, and reminder application. Built with React, TypeScript, Tailwind CSS, and `vite-plugin-pwa`, Piku runs locally in the browser or as an installable standalone mobile PWA—and includes an integrated **Native Android Studio Project & APK Exporter** (`Room` + `WorkManager` + `AlarmManager`).

---

## Features

### 1. 24-Hour Daily Circle & Morning Planner
- **Morning Day Prompt**: Prompts at the start of the day to plan your full task list.
- **Live 24-Hour Progress Ring**: Displays daily completion percentage alongside completed, remaining, and total planned task counts plus a live countdown to midnight.
- **Category & Status Filters**: Filter tasks by `All`, `Pending`, `Completed`, or category, with 1-tap completion toggles, celebratory feedback, and synthesized chime alerts.

### 2. Hour-Wise 24-Hour Timeframe Utilization
- **Real vs. Planned Tracking**: Log how each hour (`00:00` – `23:59`) was actually spent using 5 color-coded categories:
  - **Productive** (Emerald)
  - **Necessary** (Sky)
  - **Leisure / Rest** (Amber)
  - **Unproductive** (Rose)
  - **Unrecorded** (Slate)
- **Continuous 24h Strip & Block Assigner**: Inspect the whole day on a 24-segment timeline or fill multi-hour blocks in one action.
- **Hourly Prompts**: Quick 1-tap prompts to classify unrecorded past hours.

### 3. Dynamic 30-Minute Chatty Nudges
- Gentle, non-alarm check-ins every 30 minutes asking whether you are still working on your active task or ready to mark it completed.
- Supports Web Audio API synthesized chimes (no external audio files needed), device haptics, browser notifications, and quick actions (`Yes, Task Completed!`, `Still working on it`, `Nudge in 15m`).

### 4. Personal Reminders & Events
- Create, edit, and delete reminders for **Appointments**, **Meetings**, **Deadlines**, **Events**, and **Personal** commitments.
- Configurable **High / Medium / Low** priority, custom date/time, and **Daily / Weekly / Monthly** recurrence.
- Includes `+5m`, `+10m`, and `+30m` snooze controls and automatic next-cycle scheduling for recurring items.

### 5. Daily Habit Timing Tracker
- Track the exact daily start and end timing of recurring routines against target timeframes.
- Built-in live stopwatch (`Start` / `Stop & Save`) and manual time-entry modal with streak tracking.

### 6. Weekly, Monthly & Jan–Dec Analytics
- **Weekly Report**: 7-day completion bar chart, weekly average, and best-performing day.
- **Monthly & Full-Year Breakdown**: Aggregated monthly completion rates and a 12-month **January – December** progress grid.
- **Time Utilization Summary**: Cumulative color-coded hours breakdown across all logged days.

### 7. Offline Mobile App & Native Android Studio Exporter
- **Installable Offline PWA**: Precached via Workbox (`vite-plugin-pwa`) with `localStorage` persistence and zero runtime network requirements.
- **Native Android Project Export**: Click **APK** in the header to inspect and download `Piku-Android-Project.zip` containing Kotlin/Compose Gradle configs, `AndroidManifest.xml`, Room SQLite entities, `PikuAlarmReceiver`, and `BootReceiver`.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, `canvas-confetti`
- **Offline / PWA**: `vite-plugin-pwa` (Workbox service worker + Web App Manifest)
- **Packaging & Server**: `jszip` (in-browser Android Studio ZIP export), Express (`server.js` for production static serving)
- **Testing**: Node.js built-in test runner (`node:test` + `tsx`)

---

## Getting Started

### Prerequisites
- **Node.js** 20+ (22 recommended)
- **npm** (or `bun`)

### Installation

```bash
npm install
```

### Run Locally (Development)

```bash
npm run dev
```

The app starts on `http://localhost:3000`.

### Build & Run Production Server

```bash
npm run build
npm start
```

### Type-Check & Unit Tests

Run TypeScript type checking:
```bash
npm run lint
```

Run the pure-logic unit test suites:
```bash
npx --yes tsx --test src/utils/taskCalculations.test.ts src/utils/timeframeCalculations.test.ts src/utils/reminderEngine.test.ts
```

---

## Running on Mobile & Building the Android APK

### Option A: Install Directly as an Offline Mobile App (PWA)
1. Deploy or host the built app over HTTPS (or open the shared URL on your mobile browser).
2. Tap **Install** in the app header or choose **Add to Home Screen / Install App** from your browser menu.
3. Launch Piku from your home screen—it opens in standalone mode and works offline.

### Option B: Build a Native Android APK
1. Open Piku and click the **APK** button in the top-right header.
2. Click **Download Project ZIP** to save `Piku-Android-Project.zip`.
3. Extract the archive and open the folder in **Android Studio**.
4. Build the debug APK via Android Studio or from the project terminal:
   ```bash
   ./gradlew assembleDebug
   ```
5. Locate the generated APK at `app/build/outputs/apk/debug/app-debug.apk`.

---

## Project Structure

```text
├── index.html                        # App entry HTML, PWA & mobile viewport meta tags
├── metadata.json                     # App metadata
├── package.json                      # Scripts & dependencies
├── server.js                         # Express static server for production builds
├── vite.config.ts                    # Vite + VitePWA configuration
├── public/                           # App icons (SVG, PNG 192/512, maskable, apple-touch)
└── src/
    ├── App.tsx                       # Root state, interval watchers, modals & tab router
    ├── main.tsx                      # React entry & service worker registration
    ├── index.css                     # Tailwind CSS imports & mobile safe-area helpers
    ├── types/
    │   └── index.ts                  # Shared TypeScript interfaces & domain types
    ├── components/
    │   ├── Header.tsx                # Top bar (offline badge, audio toggle, nudge, APK, install)
    │   ├── Navigation.tsx            # 5-tab mobile bottom navigation bar
    │   ├── DailyView.tsx             # Morning prompt, 24h completion circle & daily task list
    │   ├── TimeframeView.tsx         # 24h color strip, category stats & hour-by-hour log
    │   ├── RemindersView.tsx         # Priority/recurring reminders with snooze & edit/delete
    │   ├── HabitTimingView.tsx       # Habit timing tracker with stopwatch & manual entry
    │   ├── AnalyticsView.tsx         # Weekly chart, monthly summary & Jan–Dec matrix
    │   ├── NudgeModal.tsx            # 30-minute chatty check-in modal
    │   └── AndroidExportModal.tsx    # Native Android Studio code viewer & ZIP exporter
    └── utils/
        ├── storage.ts                # LocalStorage persistence & initial seed data
        ├── taskCalculations.ts       # Completion rate, countdown & weekly/yearly rollups
        ├── timeframeCalculations.ts  # 24-hour slot helpers & category statistics
        ├── reminderEngine.ts         # Recurrence, snooze, sorting & nudge helpers
        ├── notifications.ts          # Web Audio API chimes, haptics & browser notifications
        ├── androidProjectGenerator.ts# Native Android Kotlin/Gradle ZIP generator
        └── *.test.ts                 # Unit tests for core calculations & reminder logic
```

---

## License

Apache-2.0
