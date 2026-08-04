const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  syncData: (data) => ipcRenderer.send('sync-data', data),
  loadDb: () => ipcRenderer.invoke('load-db'),
  onDataUpdated: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('data-updated', handler);
    return () => ipcRenderer.removeListener('data-updated', handler);
  }
});
