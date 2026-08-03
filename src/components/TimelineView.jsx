import React from 'react';
import { Calendar, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function TimelineView({ tasks = [], categories = [], onEditTask }) {
  const sortedTasks = [...tasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const getCategoryColor = (catId) => {
    return categories.find(c => c.id === catId)?.color || 'var(--accent)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className="controls-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge hazard-stripe-red" style={{ fontWeight: 900, padding: '2px 8px', borderRadius: 0, color: '#ffffff' }}>
              第一種戦闘配置
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', color: '#ff0000', textShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
              &gt;_ CHRONOLOGICAL OPERATIONS LOG // 第一種戦闘配置
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font)' }}>
            TACTICAL SEQUENCE BREAKDOWN // CONDITION 1 BATTLE STATIONS DELIVERABLES & MILESTONES
          </p>
        </div>
      </div>

      <div 
        className="nerv-frame" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          position: 'relative',
          padding: '24px 20px',
          background: '#000000',
          borderColor: '#ff0000'
        }}
      >
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>
            <ShieldAlert size={40} style={{ opacity: 0.3, marginBottom: '12px', color: '#ff0000' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff0000' }}>NO SCHEDULED OPERATIONS ON TIMELINE</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>LOG NEW DIRECTIVES TO ENGAGE CHRONOLOGICAL MONITORING.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '28px' }}>
            {/* Timeline spine rendered as red & yellow hazard stripe line */}
            <div 
              style={{ 
                position: 'absolute',
                left: '8px',
                top: '0',
                bottom: '0',
                width: '6px',
                background: 'repeating-linear-gradient(-45deg, #ff0000, #ff0000 8px, #ffe600 8px, #ffe600 16px)',
                boxShadow: '0 0 8px rgba(255, 0, 0, 0.6)'
              }} 
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedTasks.map((task, idx) => {
                const catColor = getCategoryColor(task.category);
                const isCompleted = task.status === 'completed';
                const timecode = task.dueDate ? task.dueDate : 'UNSCHEDULED';

                return (
                  <div 
                    key={task.id} 
                    onClick={() => onEditTask(task)}
                    className="nerv-frame"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '14px 18px',
                      background: isCompleted ? 'rgba(0, 255, 102, 0.05)' : 'rgba(255, 0, 0, 0.05)',
                      borderLeft: `6px solid ${catColor || '#ff0000'}`,
                      borderColor: isCompleted ? 'rgba(0, 255, 102, 0.3)' : '#ff0000',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ff6600', fontFamily: 'var(--font)' }}>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.98rem', 
                            fontWeight: 700, 
                            color: isCompleted ? '#00ff66' : '#ffffff',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            fontFamily: 'var(--font)'
                          }}>
                            {task.title}
                          </span>
                          <span className={`priority-badge ${task.priority}`} style={{ borderRadius: 0 }}>
                            {task.priority?.toUpperCase()}
                          </span>
                        </div>
                        {task.description && (
                          <p style={{ fontSize: '0.82rem', color: '#ff9966', marginTop: '4px', fontFamily: 'var(--font)' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* Date node formatted in amber bracket box [ TIMECODE: {date} ] */}
                      <div 
                        style={{ 
                          border: '1px solid #ff6600', 
                          background: 'rgba(255, 102, 0, 0.12)', 
                          color: '#ff6600',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font)',
                          letterSpacing: '0.05em',
                          boxShadow: '0 0 6px rgba(255, 102, 0, 0.3)'
                        }}
                      >
                        [ TIMECODE: {timecode} ]
                      </div>

                      {task.estimatedMinutes > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#00ffcc', fontFamily: 'var(--font)', fontWeight: 700 }}>
                          <Clock size={14} />
                          {task.estimatedMinutes}M
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
