// Local Storage Management for TaskFlow Pro

export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#6366f1', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: 'HeartPulse' },
  { id: 'finance', name: 'Finance', color: '#f59e0b', icon: 'Coins' },
  { id: 'learning', name: 'Learning', color: '#8b5cf6', icon: 'BookOpen' }
];

// Clean empty initial state - NO dummy data by default
export const INITIAL_TASKS = [];
export const INITIAL_HABITS = [];

// Optional Demo Seed Data if user clicks "Load Demo Data"
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
    tags: ['Fitness', 'Routine'],
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '08:00',
    estimatedMinutes: 30,
    actualMinutes: 30,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-201', title: 'Dynamic stretch warmup', completed: true },
      { id: 'st-202', title: 'Core intervals', completed: true }
    ]
  }
];

export const DEMO_HABITS = [
  {
    id: 'demo-habit-1',
    title: 'Drink 2.5L Water Daily',
    category: 'health',
    targetDays: 7,
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
    console.error('Failed to load tasks:', e);
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
    return data ? JSON.parse(data) : { theme: 'dark', sound: true, accent: 'violet' };
  } catch (e) {
    return { theme: 'dark', sound: true, accent: 'violet' };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const exportAllData = () => {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: loadTasks(),
    categories: loadCategories(),
    habits: loadHabits(),
    settings: loadSettings()
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importData = (jsonData) => {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed.tasks && Array.isArray(parsed.tasks)) saveTasks(parsed.tasks);
    if (parsed.categories && Array.isArray(parsed.categories)) saveCategories(parsed.categories);
    if (parsed.habits && Array.isArray(parsed.habits)) saveHabits(parsed.habits);
    if (parsed.settings) saveSettings(parsed.settings);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};
