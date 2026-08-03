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
    { id: 'list', label: 'GO TO TASK LIST', icon: CheckSquare },
    { id: 'kanban', label: 'GO TO KANBAN BOARD', icon: Kanban },
    { id: 'graph', label: 'GO TO RELATIONSHIP GRAPH', icon: Network },
    { id: 'matrix', label: 'GO TO PRIORITY MATRIX', icon: Grid },
    { id: 'timeline', label: 'GO TO TIMELINE & SCHEDULE', icon: Clock },
    { id: 'calendar', label: 'GO TO CALENDAR VIEW', icon: Calendar },
    { id: 'habits', label: 'GO TO HABIT TRACKER', icon: Flame },
    { id: 'focus', label: 'GO TO FOCUS TIMER', icon: Timer },
    { id: 'analytics', label: 'GO TO ANALYTICS DASHBOARD', icon: BarChart3 },
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
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="modal-content nerv-frame" 
        style={{ 
          maxWidth: '560px', 
          padding: '18px', 
          background: '#000000', 
          borderColor: '#ff0000',
          boxShadow: '0 0 25px rgba(255, 0, 0, 0.4)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top NERV Hazard Stripe Banner */}
        <div className="hazard-stripe-red" style={{ height: '4px', width: '100%', marginBottom: '12px' }} />

        {/* Modal Title / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#ff0000', color: '#ffffff', fontSize: '0.7rem', fontWeight: 900, padding: '1px 5px', fontFamily: 'var(--font)' }}>
              警報
            </span>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', color: '#ff0000', textTransform: 'uppercase', textShadow: '0 0 8px rgba(255,0,0,0.5)' }}>
              &gt;_ NERV COMMAND TERMINAL // MAGI OVERRIDE
            </div>
          </div>
          <button className="btn-icon" style={{ width: '28px', height: '28px', borderRadius: 0, borderColor: '#ff0000', color: '#ff0000' }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Search Header with placeholder: [ 警報 ] ENTER MAGI DIRECTIVE OR SEARCH COMMAND... */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', border: '1px solid #ff0000', background: 'rgba(255, 0, 0, 0.05)', marginBottom: '12px' }}>
          <Search size={18} style={{ color: '#ff0000' }} />
          <input
            type="text"
            className="form-input"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              padding: '4px', 
              fontSize: '0.95rem', 
              fontFamily: 'var(--font)', 
              color: '#ffffff',
              outline: 'none',
              width: '100%'
            }}
            placeholder="[ 警報 ] ENTER MAGI DIRECTIVE OR SEARCH COMMAND..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto' }}>
          {/* Quick Actions */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff6600', padding: '6px 4px 2px', fontFamily: 'var(--font)', letterSpacing: '0.08em' }}>
            [ DIRECT ACTION CHANNELS ]
          </div>

          <button 
            className="nav-item" 
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255, 0, 0, 0.08)', border: '1px solid #ff0000', color: '#ffffff', borderRadius: 0 }} 
            onClick={handleCreateTask}
          >
            <div className="nav-item-left" style={{ gap: '10px' }}>
              <Plus size={16} style={{ color: '#ff0000' }} />
              <span style={{ fontFamily: 'var(--font)', fontWeight: 700 }}>&gt;_ EXECUTE: CREATE NEW TASK</span>
            </div>
            <kbd className="badge" style={{ background: '#ff0000', color: '#ffffff', border: 'none', borderRadius: 0, fontWeight: 800 }}>CTRL+N</kbd>
          </button>

          <button 
            className="nav-item" 
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255, 102, 0, 0.08)', border: '1px solid #ff6600', color: '#ffffff', borderRadius: 0 }} 
            onClick={handleDemoData}
          >
            <div className="nav-item-left" style={{ gap: '10px' }}>
              <Sparkles size={16} style={{ color: '#ff6600' }} />
              <span style={{ fontFamily: 'var(--font)', fontWeight: 700 }}>&gt;_ EXECUTE: LOAD SAMPLE DEMO DATA</span>
            </div>
          </button>

          {/* Views */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff6600', padding: '10px 4px 2px', fontFamily: 'var(--font)', letterSpacing: '0.08em' }}>
            [ SYSTEM NAVIGATION ]
          </div>

          {views.map((v) => {
            const Icon = v.icon;
            return (
              <button 
                key={v.id} 
                className="nav-item" 
                style={{ textTransform: 'uppercase', letterSpacing: '0.04em', background: '#0a0a0a', border: '1px solid #333333', color: '#ffffff', borderRadius: 0 }} 
                onClick={() => handleSelectView(v.id)}
              >
                <div className="nav-item-left" style={{ gap: '10px' }}>
                  <Icon size={16} style={{ color: '#00ffcc' }} />
                  <span style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>&gt;_ EXECUTE: {v.label}</span>
                </div>
              </button>
            );
          })}

          {/* Task Search Results */}
          {matchingTasks.length > 0 && (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff0000', padding: '10px 4px 2px', fontFamily: 'var(--font)', letterSpacing: '0.08em' }}>
                [ MATCHING DIRECTIVES FOUND ]
              </div>
              {matchingTasks.map((t) => (
                <button 
                  key={t.id} 
                  className="nav-item" 
                  style={{ textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff0000', color: '#ffffff', borderRadius: 0 }}
                  onClick={() => { onClose(); onEditTask(t); }}
                >
                  <div className="nav-item-left" style={{ gap: '10px' }}>
                    <CheckSquare size={16} style={{ color: '#ff0000' }} />
                    <span style={{ fontFamily: 'var(--font)', fontWeight: 700 }}>&gt;_ EXECUTE: {t.title}</span>
                  </div>
                  <span className={`priority-badge ${t.priority}`} style={{ borderRadius: 0 }}>{t.priority?.toUpperCase()}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
