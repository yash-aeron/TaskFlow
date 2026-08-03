import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroHeader from './components/HeroHeader';
import TaskModal from './components/TaskModal';
import ListView from './components/ListView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import HabitTracker from './components/HabitTracker';
import FocusTimer from './components/FocusTimer';
import AnalyticsView from './components/AnalyticsView';
import GraphView from './components/GraphView';
import MatrixView from './components/MatrixView';
import TimelineView from './components/TimelineView';
import Toast from './components/Toast';
import ShortcutsModal from './components/ShortcutsModal';
import CommandPalette from './components/CommandPalette';

import { 
  loadTasks, saveTasks, 
  loadCategories, saveCategories, 
  loadHabits, saveHabits, 
  loadSettings, saveSettings,
  exportAllData, importData,
  DEMO_TASKS, DEMO_HABITS
} from './utils/storage';
import { sounds } from './utils/audio';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [categories, setCategories] = useState(() => loadCategories());
  const [habits, setHabits] = useState(() => loadHabits());
  const [settings, setSettings] = useState(() => loadSettings());

  const [currentView, setCurrentView] = useState('list');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState(null);
  const [focusTask, setFocusTask] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Sync state to local storage and Electron main process
  useEffect(() => {
    saveTasks(tasks);
    if (window.electronAPI) {
      window.electronAPI.syncData({ tasks, habits });
    }
  }, [tasks, habits]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveHabits(habits);
    if (window.electronAPI) {
      window.electronAPI.syncData({ tasks, habits });
    }
  }, [habits]);

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onDataUpdated((data) => {
        if (data.tasks) setTasks(data.tasks);
        if (data.habits) setHabits(data.habits);
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    saveSettings(settings);
    const theme = settings?.theme || 'dark';
    const accent = settings?.accent || 'magi_red';
    const themeMode = settings?.themeMode || 'nerv';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-theme-mode', themeMode);
  }, [settings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('task-search-input')?.focus();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewTask();
      } else if (e.key === '?' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsShortcutsOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen]);

  // Collect all unique tags across tasks
  const allTags = useMemo(() => {
    const set = new Set();
    tasks.forEach(t => t.tags?.forEach(tag => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  // Filter tasks based on Search, Category, and Tag
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeCategory && task.category !== activeCategory) return false;
      if (activeTag && (!task.tags || !task.tags.includes(activeTag))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTag = task.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }
      return true;
    });
  }, [tasks, activeCategory, activeTag, searchQuery]);

  // Task Handlers
  const handleSaveTask = (taskData) => {
    if (taskToEdit && taskToEdit.id) {
      setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
      showToast('Task updated successfully!', 'success');
    } else {
      setTasks([taskData, ...tasks]);
      showToast('New task created!', 'success');
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const isCompleted = t.status === 'completed';
        const newStatus = isCompleted ? 'todo' : 'completed';
        if (!isCompleted) {
          showToast('Task completed!', 'success');
        }
        return {
          ...t,
          status: newStatus,
          completedAt: isCompleted ? null : new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    showToast('Task removed', 'info');
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return t;
    }));
    showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const handleOpenNewTask = (presetDate = null) => {
    setTaskToEdit(presetDate ? { dueDate: presetDate } : null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleStartFocusTimer = (task) => {
    setFocusTask(task);
    setCurrentView('focus');
    showToast(`Focus session set for: "${task.title}"`, 'info');
  };

  const handleLogFocusTime = (taskId, minutes) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          actualMinutes: (t.actualMinutes || 0) + minutes
        };
      }
      return t;
    }));
    showToast(`Logged ${minutes} minutes of focus time!`, 'success');
  };

  // Habit Handlers
  const handleSaveHabit = (habit) => {
    setHabits([...habits, habit]);
    showToast('New habit added!', 'success');
  };

  const handleDeleteHabit = (habitId) => {
    setHabits(habits.filter(h => h.id !== habitId));
    showToast('Habit removed', 'info');
  };

  const handleToggleHabitDay = (habitId, dateStr) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const history = { ...(h.history || {}) };
        history[dateStr] = !history[dateStr];
        return { ...h, history };
      }
      return h;
    }));
  };

  // Demo Data Loader
  const handleLoadDemoData = () => {
    setTasks(DEMO_TASKS);
    setHabits(DEMO_HABITS);
    sounds.playComplete();
    showToast('Sample demo data loaded!', 'success');
  };

  // Import / Export
  const handleImportData = (jsonData) => {
    const ok = importData(jsonData);
    if (ok) {
      setTasks(loadTasks());
      setCategories(loadCategories());
      setHabits(loadHabits());
      setSettings(loadSettings());
      sounds.playComplete();
      showToast('Data backup successfully restored!', 'success');
    } else {
      showToast('Failed to import backup file', 'error');
    }
  };

  return (
    <div className="app-container">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTask={() => handleOpenNewTask()}
        theme={settings?.theme || 'dark'}
        setTheme={(newTheme) => setSettings({ ...(settings || {}), theme: newTheme })}
        soundEnabled={settings?.sound ?? true}
        setSoundEnabled={(newSound) => setSettings({ ...(settings || {}), sound: newSound })}
        themeMode={settings?.themeMode || 'nerv'}
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
          themeMode={settings?.themeMode || 'nerv'}
        />

        <div className="content-wrapper">
          <main className="content-viewport">
            {currentView === 'list' && (
              <>
                <HeroHeader
                  tasks={tasks}
                  onOpenNewTask={() => handleOpenNewTask()}
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
              />
            )}

            {currentView === 'graph' && (
              <GraphView
                tasks={filteredTasks}
                categories={categories}
                onEditTask={handleEditTask}
                onOpenNewTask={() => handleOpenNewTask()}
              />
            )}

            {currentView === 'matrix' && (
              <MatrixView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
                onOpenNewTask={() => handleOpenNewTask()}
              />
            )}

            {currentView === 'timeline' && (
              <TimelineView
                tasks={filteredTasks}
                categories={categories}
                onEditTask={handleEditTask}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onOpenNewTaskWithDate={(dateStr) => handleOpenNewTask(dateStr)}
                categories={categories}
              />
            )}

            {currentView === 'habits' && (
              <HabitTracker
                habits={habits}
                onSaveHabit={handleSaveHabit}
                onDeleteHabit={handleDeleteHabit}
                onToggleHabitDay={handleToggleHabitDay}
              />
            )}

            {currentView === 'focus' && (
              <FocusTimer
                tasks={tasks}
                initialTask={focusTask}
                onLogFocusTime={handleLogFocusTime}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                tasks={tasks}
                categories={categories}
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
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setCurrentView={setCurrentView}
        onOpenNewTask={handleOpenNewTask}
        onLoadDemoData={handleLoadDemoData}
        tasks={tasks}
        onEditTask={handleEditTask}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
