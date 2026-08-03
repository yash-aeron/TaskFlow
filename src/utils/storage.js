// Local Storage Management for TaskFlow

export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#6366f1', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: 'HeartPulse' },
  { id: 'finance', name: 'Finance', color: '#f59e0b', icon: 'Coins' },
  { id: 'learning', name: 'Learning', color: '#8b5cf6', icon: 'BookOpen' }
];

export const INITIAL_TASKS = [];
export const INITIAL_HABITS = [];

export const DEMO_TASKS = [
  {
    id: 'demo-task-1',
    title: 'Design UI/UX Wireframes for Product Launch',
    description: 'Create high-fidelity interactive mockups with dark glassmorphism aesthetic and micro-interactions.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'work',
    tags: ['Design', 'UI/UX', 'Figma'],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '16:00',
    estimatedMinutes: 120,
    actualMinutes: 45,
    createdAt: new Date().toISOString(),
    completedAt: null,
    subtasks: [
      { id: 'st-1', title: 'Gather competitor benchmarks', completed: true },
      { id: 'st-2', title: 'Define design tokens & grid system', completed: true },
      { id: 'st-3', title: 'Mockup main view components', completed: false }
    ]
  },
  {
    id: 'demo-task-2',
    title: 'Morning 30-Minute HIIT Session',
    description: 'Full body cardio workout focusing on core strength.',
    status: 'completed',
    priority: 'high',
    category: 'health',
    tags: ['Fitness', 'Morning'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '08:00',
    estimatedMinutes: 30,
    actualMinutes: 30,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtasks: []
  }
];

export const DEMO_HABITS = [
  {
    id: 'demo-habit-1',
    title: 'Drink 2L Water Daily',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    history: {
      [new Date().toISOString().split('T')[0]]: true,
      [new Date(Date.now() - 86400000).toISOString().split('T')[0]]: true
    }
  }
];

const KEYS = {
  TASKS: 'taskflow_tasks_v1',
  CATEGORIES: 'taskflow_categories_v1',
  HABITS: 'taskflow_habits_v1',
  SETTINGS: 'taskflow_settings_v1'
};

export const loadTasks = () => {
  try {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : INITIAL_TASKS;
  } catch (e) {
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
};

export const loadCategories = () => {
  try {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories) => {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories:', e);
  }
};

export const loadHabits = () => {
  try {
    const data = localStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : INITIAL_HABITS;
  } catch (e) {
    return INITIAL_HABITS;
  }
};

export const saveHabits = (habits) => {
  try {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
};

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { theme: 'dark', sound: true, accent: 'magi_red', themeMode: 'nerv' };
  } catch (e) {
    return { theme: 'dark', sound: true, accent: 'magi_red', themeMode: 'nerv' };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^"]*/gi, '')
    .trim();
}

export const importData = (jsonData) => {
  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed || typeof parsed !== 'object') return false;

    // Whitelist and sanitize Tasks
    if (Array.isArray(parsed.tasks)) {
      const safeTasks = parsed.tasks.map(t => ({
        id: sanitizeString(t.id) || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: sanitizeString(t.title) || 'Untitled Task',
        description: sanitizeString(t.description),
        status: ['todo', 'in_progress', 'completed', 'backlog'].includes(t.status) ? t.status : 'todo',
        priority: ['urgent', 'high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
        category: sanitizeString(t.category) || 'work',
        tags: Array.isArray(t.tags) ? t.tags.map(sanitizeString).filter(Boolean) : [],
        dueDate: /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : null,
        dueTime: typeof t.dueTime === 'string' ? sanitizeString(t.dueTime) : null,
        estimatedMinutes: Number(t.estimatedMinutes) || 0,
        actualMinutes: Number(t.actualMinutes) || 0,
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
        completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks.map(st => ({
          id: sanitizeString(st.id) || `subtask-${Date.now()}`,
          title: sanitizeString(st.title),
          completed: Boolean(st.completed)
        })) : []
      }));
      saveTasks(safeTasks);
    }

    // Whitelist and sanitize Categories
    if (Array.isArray(parsed.categories)) {
      const safeCategories = parsed.categories.map(c => ({
        id: sanitizeString(c.id) || 'work',
        name: sanitizeString(c.name) || 'General',
        color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c.color) ? c.color : '#6366f1',
        icon: sanitizeString(c.icon) || 'Briefcase'
      }));
      saveCategories(safeCategories);
    }

    // Whitelist and sanitize Habits (preventing Prototype Pollution)
    if (Array.isArray(parsed.habits)) {
      const safeHabits = parsed.habits.map(h => {
        const safeHistory = {};
        if (h.history && typeof h.history === 'object') {
          Object.keys(h.history).forEach(k => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(k) && !['__proto__', 'constructor', 'prototype'].includes(k)) {
              safeHistory[k] = Boolean(h.history[k]);
            }
          });
        }
        return {
          id: sanitizeString(h.id) || `habit-${Date.now()}`,
          title: sanitizeString(h.title) || 'Untitled Habit',
          frequency: ['daily', 'weekly'].includes(h.frequency) ? h.frequency : 'daily',
          createdAt: typeof h.createdAt === 'string' ? h.createdAt : new Date().toISOString(),
          history: safeHistory
        };
      });
      saveHabits(safeHabits);
    }

    // Whitelist and sanitize Settings
    if (parsed.settings && typeof parsed.settings === 'object') {
      const ALLOWED_THEME_MODES = ['nerv', 'persona'];
      const ALLOWED_ACCENTS = ['magi_red', 'nerv_amber', 'terminal_cyan', 'terminal_green', 'seele_monolith'];
      const safeSettings = {
        theme: parsed.settings.theme === 'light' ? 'light' : 'dark',
        sound: Boolean(parsed.settings.sound ?? true),
        themeMode: ALLOWED_THEME_MODES.includes(parsed.settings.themeMode) ? parsed.settings.themeMode : 'nerv',
        accent: ALLOWED_ACCENTS.includes(parsed.settings.accent) ? parsed.settings.accent : 'magi_red'
      };
      saveSettings(safeSettings);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};

export const storage = {
  loadTasks,
  saveTasks,
  loadCategories,
  saveCategories,
  loadHabits,
  saveHabits,
  loadSettings,
  saveSettings
};

export const demoTasks = DEMO_TASKS;
export const demoCategories = DEFAULT_CATEGORIES;
export const demoHabits = DEMO_HABITS;
