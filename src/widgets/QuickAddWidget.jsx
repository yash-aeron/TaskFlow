import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function QuickAddWidget() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      status: 'todo',
      priority,
      category: 'work',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
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
          <Plus size={13} style={{ color: '#5e6ad2' }} />
          <span>Quick Add Task</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={13} /></button>
      </div>

      <form className="widget-body" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="widget-input" 
          placeholder="Task title..." 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          autoFocus 
        />
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center' }}>
          <select 
            className="widget-input" 
            style={{ width: 'auto', padding: '4px 6px' }}
            value={priority} 
            onChange={e => setPriority(e.target.value)}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button type="submit" className="widget-btn">Add Task</button>
        </div>
      </form>
    </div>
  );
}
