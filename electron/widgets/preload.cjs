const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widgetAPI', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  getHabits: () => ipcRenderer.invoke('get-habits'),
  addTask: (task) => ipcRenderer.send('add-task', task),
  toggleTask: (taskId) => ipcRenderer.send('toggle-task', taskId),
  toggleHabit: (habitId, dateStr) => ipcRenderer.send('toggle-habit', { habitId, dateStr }),
  logFocus: (taskId, minutes) => ipcRenderer.send('log-focus', { taskId, minutes }),
  closeWidget: () => ipcRenderer.send('close-widget'),
  onDataUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('data-update', handler);
    return () => ipcRenderer.removeListener('data-update', handler);
  }
});
