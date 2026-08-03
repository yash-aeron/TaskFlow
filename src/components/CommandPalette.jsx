import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Plus, Flame, Timer, BarChart3, X } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CommandPalette({ 
  isOpen, onClose, tasks = [], onSelectTask, onOpenNewTask, setCurrentView, themeMode = 'nerv'
}) {
  const [query, setQuery] = useState('');
  const isPersona = themeMode === 'persona';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { id: 'new-task', label: isPersona ? 'INITIALIZE NEW MISSION' : 'INITIALIZE NEW OPERATION', icon: Plus, action: () => onOpenNewTask() },
    { id: 'view-list', label: isPersona ? 'SWITCH TO SKiLL / TaSKs' : 'SWITCH TO OPERATIONS LOG', icon: CheckSquare, action: () => setCurrentView('list') },
    { id: 'view-habits', label: isPersona ? 'SWITCH TO CONFIDANT HABiTS' : 'SWITCH TO PATTERN RECOGNITION', icon: Flame, action: () => setCurrentView('habits') },
    { id: 'view-focus', label: isPersona ? 'SWITCH TO RELOAD FOCUS' : 'SWITCH TO ENTRY PLUG TIMER', icon: Timer, action: () => setCurrentView('focus') },
    { id: 'view-analytics', label: isPersona ? 'SWITCH TO SYSTEM STATS' : 'SWITCH TO MAGI ANALYSIS', icon: BarChart3, action: () => setCurrentView('analytics') },
  ];

  const filteredTasks = query.trim() 
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleActionClick = (act) => {
    sounds.playClick();
    act();
    onClose();
  };

  const handleTaskClick = (t) => {
    sounds.playClick();
    onSelectTask(t);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={isPersona ? "modal-content persona-card" : "modal-content nerv-frame"} style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <Search size={16} style={{ color: isPersona ? '#00e5ff' : '#ff0000' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder={isPersona ? "Enter command / search mission..." : "[ 警報 ] ENTER MAGI DIRECTIVE OR SEARCH COMMAND..."}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{ border: 'none', background: 'transparent' }}
          />
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
          {actions.map(act => {
            const Icon = act.icon;
            return (
              <div 
                key={act.id} 
                onClick={() => handleActionClick(act.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  background: '#000000', border: '1px solid var(--border)', cursor: 'pointer'
                }}
              >
                <Icon size={14} style={{ color: isPersona ? '#00e5ff' : '#ff6600' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font)' }}>
                  {act.label}
                </span>
              </div>
            );
          })}

          {filteredTasks.map(t => (
            <div 
              key={t.id}
              onClick={() => handleTaskClick(t)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px',
                background: '#000000', border: '1px solid var(--border-amber)', cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'var(--font)' }}>{t.title}</span>
              <span className="priority-badge low">{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
