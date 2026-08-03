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

// ── In-memory data (synced from main window via IPC) ──────────────────────────
let appTasks = [];
let appHabits = [];

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

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Save bounds on resize/move
  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const b = mainWindow.getBounds();
    const cfg = loadConfig();
    cfg.mainWindow = b;
    saveConfig(cfg);
  };
  mainWindow.on('resized', saveBounds);
  mainWindow.on('moved', saveBounds);

  // Hide to tray instead of quitting
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

  win.setAlwaysOnTop(true, 'screen-saver');

  if (isDev) {
    win.loadURL(`http://localhost:5173/${cfg.url}`);
  } else {
    win.loadFile(path.join(__dirname, `../dist/${cfg.url}`));
  }

  // Persist position
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

// ── Broadcast to all widget windows ──────────────────────────────────────────
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
      label: mainWindow?.isVisible() ? 'Hide Main Window' : 'Show Main Window',
      click: () => {
        if (!mainWindow) return;
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    { label: 'Widgets', enabled: false },
    ...widgetItems,
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────

ipcMain.on('sync-data', (_, { tasks, habits }) => {
  appTasks  = tasks  ?? appTasks;
  appHabits = habits ?? appHabits;
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.handle('get-tasks',  () => appTasks);
ipcMain.handle('get-habits', () => appHabits);

ipcMain.on('add-task', (_, task) => {
  appTasks = [task, ...appTasks];
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { tasks: appTasks });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.on('toggle-task', (_, taskId) => {
  appTasks = appTasks.map(t => {
    if (t.id !== taskId) return t;
    const completed = t.status !== 'completed';
    return {
      ...t,
      status: completed ? 'completed' : 'todo',
      completedAt: completed ? new Date().toISOString() : null,
    };
  });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { tasks: appTasks });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.on('toggle-habit', (_, { habitId, dateStr }) => {
  appHabits = appHabits.map(h => {
    if (h.id !== habitId) return h;
    const history = { ...(h.history || {}) };
    history[dateStr] = !history[dateStr];
    return { ...h, history };
  });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('data-updated', { habits: appHabits });
  }
  broadcastToWidgets('data-update', { tasks: appTasks, habits: appHabits });
});

ipcMain.on('log-focus', (_, { taskId, minutes }) => {
  appTasks = appTasks.map(t => {
    if (t.id !== taskId) return t;
    return { ...t, actualMinutes: (t.actualMinutes || 0) + minutes };
  });
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
  createMainWindow();
  createTray();

  const config = loadConfig();
  const openWidgets = config.openWidgets ?? ['today', 'timer'];
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
