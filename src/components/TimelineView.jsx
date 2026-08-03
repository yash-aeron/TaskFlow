import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function TimelineView({ tasks = [], categories = [], onEditTask }) {
  const sortedTasks = [...tasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const getCategoryColor = (catId) => {
    return categories.find(c => c.id === catId)?.color || 'var(--accent)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className="controls-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>&gt;_ CHRONOLOGICAL LOG</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sequential timeline breakdown of upcoming project deliverables and milestones.
          </p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--accent)' }}>
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No scheduled tasks on timeline.
          </div>
        ) : (
          sortedTasks.map((task, idx) => {
            const catColor = getCategoryColor(task.category);
            const isCompleted = task.status === 'completed';

            return (
              <div 
                key={task.id} 
                onClick={() => onEditTask(task)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderLeft: `4px solid ${catColor}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', width: '30px' }}>
                  #{idx + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  </div>
                  {task.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{task.description}</p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {task.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                      <Calendar size={14} />
                      {task.dueDate}
                    </span>
                  )}

                  {task.estimatedMinutes > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {task.estimatedMinutes}m
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
