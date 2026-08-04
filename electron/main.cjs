'use strict';

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

// ── Persistent config (widget positions, visibility) ──────────────────────────
function getConfigPath() {
  return path.join(app.getPath('userData'), 'taskflow-config.json');
}
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(getConfigPath(), 'utf8')); }
  catch { return {}; }
}
function saveConfig(data) {
  try { fs.writeFileSync(getConfigPath(), JSON.stringify(data, null, 2)); }
  catch (e) { console.error('Config save failed', e); }
}

// ── Persistent database (tasks, habits, theme) ────────────────────────────────
function getDbPath() {
  return path.join(app.getPath('userData'), 'taskflow-db.json');
}
function loadDb() {
  try {
    const data = JSON.parse(fs.readFileSync(getDbPath(), 'utf8'));
    if (Array.isArray(data.tasks)) appTasks = data.tasks;
    if (Array.isArray(data.habits)) appHabits = data.habits;
    if (typeof data.themeMode === 'string') appThemeMode = data.themeMode;
    return { tasks: appTasks, habits: appHabits, themeMode: appThemeMode };
  } catch {
    return { tasks: appTasks, habits: appHabits, themeMode: appThemeMode };
  }
}
function saveDb() {
  try {
    fs.writeFileSync(getDbPath(), JSON.stringify({ tasks: appTasks, habits: appHabits, themeMode: appThemeMode }, null, 2));
  } catch (e) {
    console.error('DB save failed', e);
  }
}

// ── In-memory data (synced from main window & disk DB) ─────────────────────────
let appTasks = [];
let appHabits = [];
let appThemeMode = 'nerv';

// ── Windows ───────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
const widgetWindows = {};

const WIDGETS = {
  today:    { width: 290, height: 430, title: "Today's Tasks",  url: 'today.html' },
  timer:    { width: 250, height: 270, title: 'Pomodoro',       url: 'timer.html' },
  habits:   { width: 290, height: 340, title: 'Habit Streaks',  url: 'habits.html' },
  quickadd: { width: 290, height: 190, title: 'Quick Add',      url: 'quickadd.html' },
};

// Security helper: attach window navigation interceptors to prevent untrusted navigation
function attachNavigationInterceptors(win) {
  if (!win || !win.webContents) return;
  win.webContents.on('will-navigate', (event, url) => {
    // Intercept and prevent navigating away from bundled app files
    const isAllowedDev = isDev && url.startsWith('http://localhost:5173');
    const isAllowedFile = url.startsWith('file://');
    if (!isAllowedDev && !isAllowedFile) {
      event.preventDefault();
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

// ── Main Window ───────────────────────────────────────────────────────────────
function createMainWindow() {
  const config = loadConfig();

  mainWindow = new BrowserWindow({
    width:  config.mainWindow?.width  ?? 1260,
    height: config.mainWindow?.height ?? 820,
    x:      config.mainWindow?.x,
    y:      config.mainWindow?.y,
    minWidth:  800,
    minHeight: 600,
    backgroundColor: '#101010',
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'TaskFlow',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  attachNavigationInterceptors(mainWindow);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const b = mainWindow.getBounds();
    const cfg = loadConfig();
    cfg.mainWindow = b;
    saveConfig(cfg);
  };
  mainWindow.on('resized', saveBounds);
  mainWindow.on('moved', saveBounds);

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('show', () => updateTrayMenu());
  mainWindow.on('hide', () => updateTrayMenu());
}

// ── Widget Windows ────────────────────────────────────────────────────────────
function createWidget(id) {
  if (widgetWindows[id]) {
    widgetWindows[id].show();
    widgetWindows[id].focus();
    return;
  }

  const cfg    = WIDGETS[id];
  const config = loadConfig();
  const saved  = config.widgets?.[id];

  const win = new BrowserWindow({
    width:  cfg.width,
    height: cfg.height,
    x: saved?.x ?? (80 + Object.keys(widgetWindows).length * 40),
    y: saved?.y ?? (80 + Object.keys(widgetWindows).length * 40),
    frame:       false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable:   false,
    focusable:   true,
    title: cfg.title,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'widgets/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  attachNavigationInterceptors(win);
  win.setAlwaysOnTop(true, 'screen-saver');

  if (isDev) {
    win.loadURL(`http://localhost:5173/${cfg.url}`);
  } else {
    win.loadFile(path.join(__dirname, `../dist/${cfg.url}`));
  }

  win.on('moved', () => {
    if (!win || win.isDestroyed()) return;
    const [x, y] = win.getPosition();
    const config = loadConfig();
    if (!config.widgets) config.widgets = {};
    config.widgets[id] = { x, y };
    saveConfig(config);
    updateTrayMenu();
  });

  win.on('closed', () => {
    delete widgetWindows[id];
    updateTrayMenu();
  });

  widgetWindows[id] = win;
  updateTrayMenu();
}

function closeWidget(id) {
  if (widgetWindows[id]) {
    widgetWindows[id].close();
  }
}

function toggleWidget(id) {
  if (widgetWindows[id]) {
    closeWidget(id);
  } else {
    createWidget(id);
  }
}

function broadcastToWidgets(channel, data) {
  Object.values(widgetWindows).forEach((win) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, data);
    }
  });
}

// ── System Tray ───────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('TaskFlow');
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;

  const widgetItems = Object.entries(WIDGETS).map(([id, cfg]) => ({
    label: cfg.title,
    type:  'checkbox',
    checked: !!widgetWindows[id],
    click: () => toggleWidget(id),
  }));

  const menu = Menu.buildFromTemplate([
    {
      label: mainWindow && mainWindow.isVisible() ? 'Hide TaskFlow' : 'Open TaskFlow',
      click: () => {
        if (!mainWindow) return;
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },
    { type: 'separator' },
    { label: 'Desktop Widgets', enabled: false },
    ...widgetItems,
    { type: 'separator' },
    {
      label: 'Quit TaskFlow',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('load-db', () => loadDb());
ipcMain.handle('get-tasks', () => appTasks);
ipcMain.handle('get-habits', () => appHabits);

ipcMain.on('sync-data', (_, payload) => {
  if (payload && Array.isArray(payload.tasks)) {
    appTasks = payload.tasks;
  }
  if (payload && Array.isArray(payload.habits)) {
    appHabits = payload.habits;
  }
  if (payload && typeof payload.themeMode === 'string') {
    appThemeMode = payload.themeMode;
  }
  saveDb();
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits, themeMode: appThemeMode });
});

// Fix 2B: Validate task payload before adding to prevent malformed IPC data
ipcMain.on('add-task', (_, task) => {
  if (!task || typeof task !== 'object') return;
  const safeTask = {
    ...task,
    id: (task.id && typeof task.id === 'string') ? task.id : `task-${Date.now()}`,
    title: typeof task.title === 'string' ? task.title : 'Untitled Task',
    status: typeof task.status === 'string' ? task.status : 'todo',
    priority: typeof task.priority === 'string' ? task.priority : 'medium',
  };
  appTasks = [safeTask, ...appTasks.filter(t => t.id !== safeTask.id)];
  saveDb();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { tasks: appTasks });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.on('toggle-task', (_, taskId) => {
  if (!taskId || typeof taskId !== 'string') return;
  appTasks = appTasks.map(t => {
    if (t.id !== taskId) return t;
    const completed = t.status !== 'completed';
    return {
      ...t,
      status: completed ? 'completed' : 'todo',
      completedAt: completed ? new Date().toISOString() : null,
    };
  });
  saveDb();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { tasks: appTasks });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

// Fix 1A: Validate dateStr regex & prototype pollution prevention
ipcMain.on('toggle-habit', (_, payload) => {
  if (!payload || typeof payload !== 'object') return;
  const { habitId, dateStr } = payload;

  if (!habitId || typeof habitId !== 'string' || !dateStr || typeof dateStr !== 'string') return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return; // Strict YYYY-MM-DD validation
  if (['__proto__', 'constructor', 'prototype'].includes(dateStr)) return;

  appHabits = appHabits.map(h => {
    if (h.id !== habitId) return h;
    const history = { ...(h.history || {}) };
    history[dateStr] = !history[dateStr];
    return { ...h, history };
  });
  saveDb();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { habits: appHabits });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

// Fix 2A: Coerce minutes parameter to Number to prevent string concatenation ("4525")
ipcMain.on('log-focus', (_, payload) => {
  if (!payload || typeof payload !== 'object') return;
  const { taskId, minutes } = payload;
  if (!taskId || typeof taskId !== 'string') return;

  const addedMins = Number(minutes) || 0;
  appTasks = appTasks.map(t => {
    if (t.id !== taskId) return t;
    const currentMins = Number(t.actualMinutes) || 0;
    return { ...t, actualMinutes: currentMins + addedMins };
  });
  saveDb();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { tasks: appTasks });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.on('close-widget', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// ── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  loadDb();
  createMainWindow();
  createTray();

  const config = loadConfig();
  const openWidgets = config.openWidgets ?? [];
  openWidgets.forEach(id => {
    if (WIDGETS[id]) createWidget(id);
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
  const config = loadConfig();
  config.openWidgets = Object.keys(widgetWindows);
  saveConfig(config);
});

app.on('window-all-closed', () => {
  // Stay running in tray
});

app.on('activate', () => {
  if (mainWindow) mainWindow.show();
});
