import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroHeader from './components/HeroHeader';
import ListView from './components/ListView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import FocusTimer from './components/FocusTimer';
import HabitTracker from './components/HabitTracker';
import AnalyticsView from './components/AnalyticsView';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';
import ShortcutsModal from './components/ShortcutsModal';
import GraphView from './components/GraphView';
import MatrixView from './components/MatrixView';
import TimelineView from './components/TimelineView';
import SplashIntro from './components/SplashIntro';
import HUDOverlay from './components/HUDOverlay';

import { storage, demoTasks, demoCategories, demoHabits } from './utils/storage';
import { sounds } from './utils/audio';

export default function App() {
  // Electron: disk DB (main process) is the single source of truth.
  // Browser dev: localStorage.
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const [showSplash, setShowSplash] = useState(true);
  const [tasks, setTasks] = useState(() => isElectron ? [] : storage.loadTasks());
  const [categories, setCategories] = useState(() => storage.loadCategories());
  const [habits, setHabits] = useState(() => isElectron ? [] : storage.loadHabits());
  const [settings, setSettings] = useState(() => storage.loadSettings());
  const hydratedRef = useRef(!isElectron); // skip sync until DB hydrated

  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const [activeFocusTask, setActiveFocusTask] = useState(null);

  const ALLOWED_THEME_MODES = ['nerv', 'persona'];
  const ALLOWED_ACCENTS = ['magi_red', 'nerv_amber', 'terminal_cyan', 'terminal_green', 'seele_monolith'];

  const themeMode = ALLOWED_THEME_MODES.includes(settings?.themeMode) ? settings.themeMode : 'nerv';
  const safeAccent = ALLOWED_ACCENTS.includes(settings?.accent) ? settings.accent : 'magi_red';

  // Sync settings and HTML root theme attributes
  useEffect(() => {
    storage.saveSettings(settings);
    
    if (settings?.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    document.documentElement.setAttribute('data-accent', safeAccent);
    document.documentElement.setAttribute('data-theme-mode', themeMode);
  }, [settings, safeAccent, themeMode]);

  // Keep the audio engine's enabled flag in sync with the persisted sound setting
  useEffect(() => {
    sounds.enabled = settings?.sound ?? true;
  }, [settings?.sound]);

  // Hydrate from persistent disk DB on Electron startup.
  // Disk DB is authoritative: adopt its state even when empty (prevents stale
  // localStorage copies resurrecting deleted tasks).
  useEffect(() => {
    if (window.electronAPI?.loadDb) {
      window.electronAPI.loadDb().then(db => {
        if (db) {
          if (Array.isArray(db.tasks)) {
            setTasks(db.tasks);
          }
          if (Array.isArray(db.habits)) {
            setHabits(db.habits);
          }
          if (db.themeMode) {
            setSettings(prev => ({ ...(prev || {}), themeMode: db.themeMode }));
          }
        }
        hydratedRef.current = true;
      }).catch(err => {
        console.error("Failed to load persistent DB", err);
        hydratedRef.current = true;
      });
    }
  }, []);

  // Listen for real-time updates from IPC / widgets
  useEffect(() => {
    if (window.electronAPI?.onDataUpdated) {
      const cleanup = window.electronAPI.onDataUpdated((payload) => {
        if (payload && Array.isArray(payload.tasks)) {
          setTasks(payload.tasks);
        }
        if (payload && Array.isArray(payload.habits)) {
          setHabits(payload.habits);
        }
      });
      return cleanup;
    }
  }, []);

  // Sync changes back to storage
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    storage.saveHabits(habits);
  }, [habits]);

  // Sync data and themeMode to Electron main process / widgets.
  // Debounced (300ms) and gated until DB hydration completes so the initial
  // empty state can never clobber the on-disk DB (Finding 7).
  useEffect(() => {
    if (!window.electronAPI || !hydratedRef.current) return;
    const timer = setTimeout(() => {
      window.electronAPI.syncData({ tasks, habits, themeMode });
    }, 300);
    return () => clearTimeout(timer);
  }, [tasks, habits, themeMode]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewTask();
      }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.getElementById('task-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsCommandPaletteOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const handleToggleTask = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
        const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
        return { ...task, status: nextStatus, completedAt };
      }
      return task;
    }));
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
        return { ...task, status: newStatus, completedAt };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    showToast('Operation purged from database', 'info');
  };

  const handleOpenNewTask = (dateStr = null) => {
    sounds.playClick();
    setTaskToEdit(dateStr ? { dueDate: dateStr } : null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    sounds.playClick();
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (taskToEdit && taskToEdit.id && tasks.some(t => t.id === taskToEdit.id)) {
      setTasks(prev => prev.map(t => t.id === taskToEdit.id ? taskData : t));
      showToast('Operation directive updated', 'info');
    } else {
      setTasks(prev => [taskData, ...prev]);
      showToast('New operation directive initialized', 'info');
    }
  };

  const handleSaveHabit = (newHabit) => {
    sounds.playClick();
    setHabits(prev => [newHabit, ...prev]);
    showToast('New routine pattern initialized', 'info');
  };

  const handleDeleteHabit = (habitId) => {
    sounds.playDelete();
    setHabits(prev => prev.filter(h => h.id !== habitId));
    showToast('Routine pattern purged', 'info');
  };

  const handleToggleHabitDay = (habitId, dateStr) => {
    sounds.playClick();
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const history = { ...(h.history || {}) };
        if (history[dateStr]) {
          delete history[dateStr];
        } else {
          history[dateStr] = true;
        }
        return { ...h, history };
      }
      return h;
    }));
  };

  const handleStartFocusTimer = (task) => {
    sounds.playClick();
    setActiveFocusTask(task);
    setCurrentView('focus');
  };

  const handleLogFocusTime = (taskId, minutes) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, actualMinutes: (t.actualMinutes || 0) + minutes };
      }
      return t;
    }));
    showToast(`Logged ${minutes} minutes of focus sync`, 'info');
  };

  const handleLoadDemoData = () => {
    sounds.playClick();
    setTasks(demoTasks);
    setCategories(demoCategories);
    setHabits(demoHabits);
    showToast('Demo tactical dataset loaded', 'info');
  };

  const exportAllData = () => {
    sounds.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, categories, habits, settings }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup dataset exported', 'info');
  };

  const handleImportData = (jsonString) => {
    try {
      // Route through the whitelisting sanitizer in storage.js (protects against
      // prototype pollution and injected markup) instead of trusting raw JSON.
      const ok = storage.importData(jsonString);
      if (!ok) throw new Error('import failed');
      // Reload the sanitized, persisted copies so React state mirrors storage.
      setTasks(storage.loadTasks());
      setCategories(storage.loadCategories());
      setHabits(storage.loadHabits());
      setSettings(storage.loadSettings());
      showToast('Dataset imported successfully', 'info');
    } catch (e) {
      showToast('Failed to parse backup dataset', 'error');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !activeCategory || task.category === activeCategory;
    const matchesTag = !activeTag || task.tags?.includes(activeTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));

  // Live EVA sync rate, driven by task completion
  const hudSyncRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  return (
    <div className="app-container">
      {showSplash && <SplashIntro onComplete={() => setShowSplash(false)} />}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTask={() => handleOpenNewTask()}
        theme={settings?.theme || 'dark'}
        setTheme={(newTheme) => setSettings({ ...(settings || {}), theme: newTheme })}
        soundEnabled={settings?.sound ?? true}
        setSoundEnabled={(newSound) => setSettings({ ...(settings || {}), sound: newSound })}
        themeMode={themeMode}
        setThemeMode={(newMode) => setSettings({ ...(settings || {}), themeMode: newMode })}
        accent={settings?.accent || 'magi_red'}
        setAccent={(newAccent) => setSettings({ ...(settings || {}), accent: newAccent })}
        onExportData={exportAllData}
        onImportData={handleImportData}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onLoadDemoData={handleLoadDemoData}
      />

      <div className="main-body">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          tasks={tasks}
          allTags={allTags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          themeMode={themeMode}
        />

        <div className="content-wrapper">
          <main className="content-viewport">
            {currentView === 'list' && (
              <>
                <HeroHeader
                  tasks={tasks}
                  onOpenNewTask={() => handleOpenNewTask()}
                  themeMode={themeMode}
                />
                <ListView
                  tasks={filteredTasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  categories={categories}
                  onStartFocusTimer={handleStartFocusTimer}
                  onOpenNewTask={() => handleOpenNewTask()}
                  onLoadDemoData={handleLoadDemoData}
                  themeMode={themeMode}
                />
              </>
            )}

            {currentView === 'kanban' && (
              <KanbanView
                tasks={filteredTasks}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                categories={categories}
                onOpenNewTask={() => handleOpenNewTask()}
                themeMode={themeMode}
              />
            )}

            {currentView === 'graph' && (
              <GraphView
                tasks={filteredTasks}
                categories={categories}
                onEditTask={handleEditTask}
                onOpenNewTask={() => handleOpenNewTask()}
                themeMode={themeMode}
              />
            )}

            {currentView === 'matrix' && (
              <MatrixView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
                onOpenNewTask={() => handleOpenNewTask()}
                themeMode={themeMode}
              />
            )}

            {currentView === 'timeline' && (
              <TimelineView
                tasks={filteredTasks}
                categories={categories}
                onEditTask={handleEditTask}
                themeMode={themeMode}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onOpenNewTaskWithDate={(dateStr) => handleOpenNewTask(dateStr)}
                categories={categories}
                themeMode={themeMode}
              />
            )}

            {currentView === 'habits' && (
              <HabitTracker
                habits={habits}
                onSaveHabit={handleSaveHabit}
                onDeleteHabit={handleDeleteHabit}
                onToggleHabitDay={handleToggleHabitDay}
                themeMode={themeMode}
              />
            )}

            {currentView === 'focus' && (
              <FocusTimer
                tasks={tasks}
                initialTask={activeFocusTask}
                onLogFocusTime={handleLogFocusTime}
                themeMode={themeMode}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                tasks={tasks}
                categories={categories}
                themeMode={themeMode}
              />
            )}
          </main>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        themeMode={themeMode}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onSelectTask={(t) => handleEditTask(t)}
        onOpenNewTask={() => handleOpenNewTask()}
        setCurrentView={setCurrentView}
        themeMode={themeMode}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        themeMode={themeMode}
      />

      <Toast toast={toast} onClose={() => setToast(null)} themeMode={themeMode} />

      <HUDOverlay syncRate={hudSyncRate} isPersona={themeMode === 'persona'} />
    </div>
  );
}
