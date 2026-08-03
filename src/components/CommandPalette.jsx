import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckSquare, Kanban, Calendar, Flame, Timer, BarChart3, Network, Grid, Clock, Sparkles, X } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  setCurrentView, 
  onOpenNewTask, 
  onLoadDemoData, 
  tasks = [], 
  onEditTask 
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const views = [
    { id: 'list', label: 'Go to Task List', icon: CheckSquare },
    { id: 'kanban', label: 'Go to Kanban Board', icon: Kanban },
    { id: 'graph', label: 'Go to Relationship Graph', icon: Network },
    { id: 'matrix', label: 'Go to Priority Matrix', icon: Grid },
    { id: 'timeline', label: 'Go to Timeline & Schedule', icon: Clock },
    { id: 'calendar', label: 'Go to Calendar View', icon: Calendar },
    { id: 'habits', label: 'Go to Habit Tracker', icon: Flame },
    { id: 'focus', label: 'Go to Focus Timer', icon: Timer },
    { id: 'analytics', label: 'Go to Analytics Dashboard', icon: BarChart3 },
  ];

  const matchingTasks = tasks.filter(t => 
    query.trim() && (
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description?.toLowerCase().includes(query.toLowerCase())
    )
  ).slice(0, 5);

  const handleSelectView = (viewId) => {
    sounds.playClick();
    setCurrentView(viewId);
    onClose();
  };

  const handleCreateTask = () => {
    sounds.playClick();
    onClose();
    onOpenNewTask();
  };

  const handleDemoData = () => {
    sounds.playClick();
    onClose();
    onLoadDemoData();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={18} style={{ color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-input"
            style={{ background: 'transparent', border: 'none', padding: '4px', fontSize: '1rem' }}
            placeholder="Type a command or search tasks... (Press Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', maxHeight: '350px', overflowY: 'auto' }}>
          {/* Quick Actions */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '6px 10px' }}>
            Actions
          </div>

          <button className="nav-item" onClick={handleCreateTask}>
            <div className="nav-item-left">
              <Plus size={16} />
              <span>Create New Task</span>
            </div>
            <kbd className="badge">Ctrl+N</kbd>
          </button>

          <button className="nav-item" onClick={handleDemoData}>
            <div className="nav-item-left">
              <Sparkles size={16} />
              <span>Load Sample Demo Data</span>
            </div>
          </button>

          {/* Views */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '10px 10px 4px' }}>
            Navigation
          </div>

          {views.map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.id} className="nav-item" onClick={() => handleSelectView(v.id)}>
                <div className="nav-item-left">
                  <Icon size={16} />
                  <span>{v.label}</span>
                </div>
              </button>
            );
          })}

          {/* Task Search Results */}
          {matchingTasks.length > 0 && (
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '10px 10px 4px' }}>
                Tasks Found
              </div>
              {matchingTasks.map((t) => (
                <button 
                  key={t.id} 
                  className="nav-item" 
                  onClick={() => { onClose(); onEditTask(t); }}
                >
                  <div className="nav-item-left">
                    <CheckSquare size={16} />
                    <span>{t.title}</span>
                  </div>
                  <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
