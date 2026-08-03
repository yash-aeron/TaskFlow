import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function TimelineView({ tasks = [], onEditTask }) {
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000', margin: 0 }}>
          {isPersona ? "PERSONA CHRONOLOGICAL TIMELINE // PALACE LOG" : ">_ CHRONOLOGICAL OPERATIONS LOG // 第一種戦闘配置"}
        </h2>
      </div>

      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '20px', position: 'relative' }}>
        {/* Timeline Spine Line */}
        <div style={{
          position: 'absolute', left: '30px', top: '20px', bottom: '20px', width: '4px',
          background: isPersona ? 'linear-gradient(180deg, #e60012 0%, #00e5ff 100%)' : 'repeating-linear-gradient(-45deg, #ff0000, #ff0000 8px, #ffe600 8px, #ffe600 16px)'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '30px' }}>
          {sortedTasks.map((task) => (
            <div 
              key={task.id} 
              className={isPersona ? "task-item persona-card" : "task-item"}
              onClick={() => onEditTask(task)}
              style={{ cursor: 'pointer', margin: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font)' }}>
                  {task.title}
                </span>
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {task.dueDate ? `[ TIMECODE: ${task.dueDate} ]` : '[ NO DEADLINE ]'}
                </span>
                {task.dueTime && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {task.dueTime}
                  </span>
                )}
                {task.status === 'completed' && (
                  <span style={{ color: '#00ff66', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 900 }}>
                    <CheckCircle size={12} /> COMPLETED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
