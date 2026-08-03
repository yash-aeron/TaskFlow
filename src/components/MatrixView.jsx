import React from 'react';
import { Flame, Clock, Users, Trash2, Plus, Edit3, CheckSquare } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function MatrixView({ tasks, onEditTask, onUpdateTaskStatus, onDeleteTask, onOpenNewTask }) {
  // Quadrants logic
  const doFirst = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');
  const schedule = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed');
  const delegate = tasks.filter(t => t.priority === 'low' && t.status !== 'completed');
  const completed = tasks.filter(t => t.status === 'completed');

  const quadrants = [
    { id: 'do_first', title: '1. DO FIRST (Urgent & Important)', icon: Flame, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', tasks: doFirst },
    { id: 'schedule', title: '2. SCHEDULE (Important, Not Urgent)', icon: Clock, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)', tasks: schedule },
    { id: 'delegate', title: '3. DELEGATE / QUICK (Urgent, Low Impact)', icon: Users, color: '#f97316', bg: 'rgba(249, 115, 22, 0.05)', tasks: delegate },
    { id: 'completed', title: '4. ARCHIVE / COMPLETED', icon: CheckSquare, color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', tasks: completed },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className="controls-header">
        <div>
          <h2>Eisenhower Priority Matrix</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Categorize tasks by urgency and importance to maximize daily focus.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewTask}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* 2x2 Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', width: '100%' }}>
        {quadrants.map(q => {
          const Icon = q.icon;

          return (
            <div 
              key={q.id} 
              className="card" 
              style={{ 
                background: q.bg, 
                borderColor: 'var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '280px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 700, color: q.color }}>
                  <Icon size={16} />
                  <span>{q.title}</span>
                </div>
                <span className="badge">{q.tasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {q.tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                    No tasks in quadrant
                  </div>
                ) : (
                  q.tasks.map(t => (
                    <div 
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{t.title}</span>
                        {t.dueDate && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {t.dueDate}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => onEditTask(t)}>
                          <Edit3 size={13} />
                        </button>
                        <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => { sounds.playDelete(); onDeleteTask(t.id); }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
