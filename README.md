# TaskFlow

TaskFlow is a desktop productivity application built with Electron, React, and Vite. Designed for speed and focus, TaskFlow features a dense, minimalist user interface inspired by modern developer tools, alongside floating Windows desktop widgets for quick task tracking and habits management.

---

## Features

### Core Application
- **Task Management**: Full task life-cycle tracking with status workflow (Backlog, To Do, In Progress, Completed), priority levels, subtasks, tags, and category assignment.
- **Multiple Views**:
  - **Task List**: Dense, keyboard-friendly list view.
  - **Kanban Board**: Drag-and-drop task workflow columns.
  - **Priority Matrix**: Eisenhower priority framework (Do First, Schedule, Delegate, Archive).
  - **Relationship Graph**: Interactive force-directed canvas visualizing task dependencies and topic linkages.
  - **Timeline**: Sequential schedule tracking with task duration estimates.
  - **Calendar**: Monthly view with date-specific task assignment.
  - **Analytics**: Overview of task completion rates, estimated vs. actual focus time, and category breakdowns.
- **Pomodoro Studio**: Integrated timer for focused work sessions, automatically logging focus time to target tasks.
- **Daily Habit Tracker**: Recurring routine tracking with streak calculation and 7-day visual heatmaps.
- **Command Palette**: Keyboard-driven navigation via `Ctrl + K`.

### Windows Desktop Widgets
TaskFlow Pro includes four frameless, translucent, always-on-top desktop widgets:
- **Today's Tasks Widget**: Displays tasks due today directly on your desktop, allowing one-click completion.
- **Focus Timer Widget**: Standalone floating Pomodoro timer with Play, Pause, and Reset controls.
- **Habit Streaks Widget**: Floating daily routine check-off interface.
- **Quick Add Widget**: Minimalist input field for capturing new tasks with priority selection.

### Native Desktop Features
- **System Tray Integration**: Background execution via the Windows notification area tray icon. Double-click restores the main window; right-click toggles individual desktop widgets.
- **Real-Time IPC Sync**: State updates synchronized bi-directionally between the main application and all active widgets via Electron IPC.
- **Persistent Widget Positions**: Screen coordinates and active widget configurations saved automatically across sessions.

---

## Tech Stack

- **Desktop Core**: Electron 31
- **UI Framework**: React 18
- **Build System**: Vite 5
- **Icons**: Lucide React
- **Packaging**: Electron Builder (NSIS / Portable Windows Executable)
- **Styling**: Vanilla CSS with a dense, minimalist monochrome token system

---

## Project Structure

```
├── electron/
│   ├── assets/              # App & Tray icons
│   ├── main.cjs             # Electron main process (window management, IPC, tray)
│   ├── preload.cjs          # Context bridge for main application
│   └── widgets/
│       └── preload.cjs      # Context bridge for floating widgets
├── src/
│   ├── components/          # React views and interface components
│   ├── utils/               # Storage, audio synthesizer, and helper functions
│   ├── widgets/             # Widget React components and HTML entry points
│   ├── App.jsx              # Application state and root router
│   ├── main.jsx             # React DOM entry point
│   └── index.css            # Core design system and global styles
├── habits.html              # Entry HTML for Habits Widget
├── index.html               # Entry HTML for Main Application
├── quickadd.html            # Entry HTML for Quick Add Widget
├── timer.html               # Entry HTML for Timer Widget
├── today.html               # Entry HTML for Today Widget
├── package.json             # Build configuration and scripts
└── vite.config.js           # Multi-page Vite build configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yash-aeron/TaskFlow.git
   cd TaskFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage & Development

### Run Web Development Server
To launch the frontend in a web browser:
```bash
npm run dev
```

### Run Electron Desktop App (Dev Mode)
To launch the main Electron process alongside Vite hot-reloading:
```bash
npm run electron:dev
```

### Run Production Build Desktop App
To build Vite bundles and run Electron locally:
```bash
npm run electron:start
```

---

## Packaging Executables

To package the application into a standalone Windows installer (`.exe`) using `electron-builder`:

```bash
npm run electron:build
```

Output directory: `release/`
- **Installer**: `release/TaskFlow Setup 1.0.0.exe`
- **Unpacked / Portable**: `release/win-unpacked/TaskFlow.exe`

---

## License

MIT License. Free for personal and commercial use.
