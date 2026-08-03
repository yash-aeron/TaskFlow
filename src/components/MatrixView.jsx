import React from 'react';
import { Plus, Edit3, Trash2, CheckCircle } from 'lucide-react';

export default function MatrixView({ tasks = [], onEditTask, onUpdateTaskStatus, onDeleteTask, onOpenNewTask }) {
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  const quadrants = [
    {
      id: 'q1',
      title: isPersona ? 'PHANTOM CRITICAL // DO FIRST' : 'MAGI MELCHIOR 1 // CRITICAL (URGENT/IMPORTANT)',
      filter: (t) => (t.priority === 'urgent' || t.priority === 'high') && t.dueDate,
      color: '#e60012'
    },
    {
      id: 'q2',
      title: isPersona ? 'VELVET STRATEGIC // SCHEDULE' : 'MAGI BALTHASAR 2 // STRATEGIC (IMPORTANT)',
      filter: (t) => (t.priority === 'medium' || t.priority === 'low') && t.dueDate,
      color: '#00e5ff'
    },
    {
      id: 'q3',
      title: isPersona ? 'ALL-OUT TACTICAL // DELEGATE' : 'MAGI CASPER 3 // TACTICAL (URGENT)',
      filter: (t) => (t.priority === 'urgent' || t.priority === 'high') && !t.dueDate,
      color: '#ff6600'
    },
    {
      id: 'q4',
      title: isPersona ? 'RELOAD LOG // DEFERRED' : 'OVERRIDE LOG // DEFERRED',
      filter: (t) => (t.priority === 'medium' || t.priority === 'low') && !t.dueDate,
      color: '#0055ff'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000', letterSpacing: '0.12em', margin: 0 }}>
            {isPersona ? "PERSONA EISENHOWER PRIORITY MATRIX // ♠ RELOAD" : ">_ MAGI EISENHOWER DECISION MATRIX // 警報 使徒襲来"}
          </h2>
          <p style={{ fontSize: '11px', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', marginTop: '4px', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
            {isPersona ? "CLASSIFY MISSIONS BY THREAT LEVEL & DEADLINE" : "CLASSIFY OPERATIONS INTO 4 TACTICAL QUADRANTS"}
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewTask}>
          <Plus size={14} />
          <span>{isPersona ? "NEW MISSION" : "[ 使徒襲来 ] INITIALIZE"}</span>
        </button>
      </div>

      {/* 4 Quadrants Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {quadrants.map(q => {
          const qTasks = tasks.filter(q.filter);
          return (
            <div key={q.id} className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '260px' }}>
              <div style={{ borderBottom: `2px solid ${q.color}`, paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: q.color, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)' }}>
                  {q.title}
                </span>
                <span className="badge">{qTasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {qTasks.map(task => (
                  <div key={task.id} className="task-item" style={{ borderLeftColor: q.color, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font)' }}>
                        {task.title}
                      </span>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => onUpdateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}>
                          <CheckCircle size={12} />
                        </button>
                        <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => onEditTask(task)}>
                          <Edit3 size={12} />
                        </button>
                        <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => onDeleteTask(task.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
