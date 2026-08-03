import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function QuickAddWidget() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [themeMode, setThemeMode] = useState('nerv');

  useEffect(() => {
    if (window.widgetAPI) {
      const unsubscribe = window.widgetAPI.onDataUpdate(({ themeMode: newMode }) => {
        if (newMode) {
          setThemeMode(newMode);
          document.documentElement.setAttribute('data-theme-mode', newMode);
        }
      });
      return unsubscribe;
    }
  }, []);

  const isPersona = themeMode === 'persona';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: '',
      status: 'todo',
      priority,
      category: 'work',
      tags: [],
      subtasks: [],
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '12:00',
      estimatedMinutes: 30,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    if (window.widgetAPI) {
      window.widgetAPI.addTask(newTask);
    }
    setTitle('');
  };

  const handleClose = () => {
    if (window.widgetAPI) window.widgetAPI.closeWidget();
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <span>{isPersona ? "♠ ALL-OUT ATTACK DEPLOY" : "[ 使徒襲来 ] QUICK DEPLOY"}</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <form className="widget-body" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="widget-input" 
          placeholder={isPersona ? "ENTER MISSION NAME..." : "[ 警報 ] ENTER OPERATION CODE / DESIGNATION..."} 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          autoFocus 
        />
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <select 
            className="widget-input" 
            style={{ width: 'auto', padding: '4px 6px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            value={priority} 
            onChange={e => setPriority(e.target.value)}
          >
            <option value="urgent">URGENT</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>
          <button type="submit" className="widget-btn">{isPersona ? "EXECUTE" : "[ 使徒 ] DEPLOY"}</button>
        </div>
      </form>
    </div>
  );
}
