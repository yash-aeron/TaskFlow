import React from 'react';
import { Plus, ArrowLeft, ArrowRight, CheckCircle, Clock, Calendar, Edit3, Trash2, ShieldAlert, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const COLUMNS = [
  { 
    id: 'backlog', 
    title: '[ 警報 ] MAGI MELCHIOR // BACKLOG', 
    magiCode: 'MAGI-01 MELCHIOR',
    color: 'var(--nerv-red)', 
    hazardClass: 'hazard-stripe-red', 
    icon: '📦' 
  },
  { 
    id: 'todo', 
    title: '[ 警報 ] MAGI BALTHASAR // TO DO', 
    magiCode: 'MAGI-02 BALTHASAR',
    color: 'var(--nerv-amber)', 
    hazardClass: 'hazard-stripe-yellow', 
    icon: '📋' 
  },
  { 
    id: 'in_progress', 
    title: '[ 警報 ] MAGI CASPER // IN PROGRESS', 
    magiCode: 'MAGI-03 CASPER',
    color: 'var(--nerv-yellow)', 
    hazardClass: 'hazard-stripe-yellow', 
    icon: '⚡' 
  },
  { 
    id: 'completed', 
    title: '[ 警報 ] DEPLOYED // COMPLETED', 
    magiCode: 'MAGI-SYS OVERRIDE',
    color: 'var(--terminal-green)', 
    hazardClass: 'hazard-stripe-cyan', 
    icon: '✅' 
  }
];

export default function KanbanView({ 
  tasks = [], 
  onUpdateTaskStatus, 
  onEditTask, 
  onDeleteTask, 
  categories = [],
  onOpenNewTask
}) {
  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'General', color: '#ff6600' };
  };

  const handleMoveColumn = (task, newStatus) => {
    if (newStatus === 'completed') {
      sounds.playComplete();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sounds.playClick();
    }
    onUpdateTaskStatus(task.id, newStatus);
  };

  const getNextStatus = (current) => {
    if (current === 'backlog') return 'todo';
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    return null;
  };

  const getPrevStatus = (current) => {
    if (current === 'completed') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    if (current === 'todo') return 'backlog';
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* MAGI Tactical Deployment Board Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', color: 'var(--nerv-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>&gt;_ MAGI TACTICAL DEPLOYMENT BOARD</span>
            <span className="kanji-text" style={{ color: 'var(--nerv-yellow)', fontSize: '0.9em' }}>// 第一種戦闘配置</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>SYSTEM LOGIC: TRIPLE REDUNDANCY</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>STATUS: CODE REINFORCED</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span className="kanji-text" style={{ color: 'var(--terminal-green)' }}>内部/外部 同期率 99.9%</span>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { sounds.playClick(); onOpenNewTask(); }}
        >
          <Plus size={16} />
          <span>[ 使徒襲来 ] INITIALIZE NEW OPERATION</span>
        </button>
      </div>

      {/* 4-Column Board */}
      <div 
        className="kanban-board" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', 
          gap: '16px', 
          width: '100%' 
        }}
      >
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id} 
              className="kanban-column nerv-frame" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#030303',
                border: '1px solid var(--border)',
                padding: '0',
                minHeight: '450px'
              }}
            >
              {/* Column Hazard Banner Header */}
              <div 
                className={col.hazardClass} 
                style={{ 
                  padding: '8px 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  borderBottom: '2px solid #000000'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{col.icon}</span>
                  <span className="kanji-text">{col.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    className="badge" 
                    style={{ 
                      background: '#000000', 
                      color: '#ffffff', 
                      borderColor: '#ffffff',
                      fontSize: '0.75rem',
                      padding: '0 6px'
                    }}
                  >
                    {colTasks.length}
                  </span>
                  <button 
                    className="btn-icon" 
                    style={{ width: '24px', height: '24px', background: '#000000', color: '#ffffff', borderColor: '#ffffff' }}
                    onClick={() => { sounds.playClick(); onOpenNewTask(); }}
                    title="Add task to this sector"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Sub-header banner showing MAGI node designation */}
              <div style={{ background: '#0a0500', padding: '4px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span>NODE: {col.magiCode}</span>
                <span>CHEVRON: /// ///</span>
              </div>

              {/* Column Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, padding: '12px', overflowY: 'auto' }}>
                {colTasks.length === 0 ? (
                  <div 
                    style={{ 
                      padding: '30px 16px', 
                      textAlign: 'center', 
                      color: 'var(--text-subtle)', 
                      fontSize: '0.78rem', 
                      border: '1px dashed var(--border)', 
                      background: '#000000',
                      fontFamily: 'var(--font)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <div>[ NO DIRECTIVES IN SECTOR ]</div>
                    <div className="kanji-text" style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.7 }}>待機状態 // NO DATA</div>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const cat = getCategoryInfo(task.category);
                    const prev = getPrevStatus(task.status);
                    const next = getNextStatus(task.status);

                    return (
                      <div 
                        key={task.id} 
                        className="card" 
                        style={{ 
                          padding: '12px', 
                          position: 'relative',
                          background: '#080808',
                          border: '1px solid var(--border-amber)',
                          borderRadius: '0'
                        }}
                      >
                        {/* Top card bar with category & priority */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span 
                            className="category-tag" 
                            style={{ 
                              backgroundColor: '#140a00', 
                              color: cat.color || 'var(--nerv-amber)', 
                              border: `1px solid ${cat.color || 'var(--nerv-amber)'}`,
                              fontSize: '0.68rem', 
                              padding: '1px 6px',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            [ {cat.name} ]
                          </span>

                          <span className={`priority-badge ${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                          {task.title}
                        </h4>

                        {/* Task Description */}
                        {task.description && (
                          <p className="task-desc" style={{ fontSize: '0.78rem', marginTop: '4px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {task.description}
                          </p>
                        )}

                        {/* Optional Date or Subtasks summary indicator */}
                        {task.dueDate && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--terminal-green)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} />
                            <span>DEADLINE: {task.dueDate} {task.dueTime || ''}</span>
                          </div>
                        )}

                        {/* Visual Chevron accent */}
                        <div style={{ display: 'flex', gap: '2px', marginTop: '8px', opacity: 0.6 }}>
                          <div style={{ height: '3px', width: '20px', background: 'var(--nerv-amber)' }}></div>
                          <div style={{ height: '3px', width: '8px', background: 'var(--nerv-red)' }}></div>
                          <div style={{ height: '3px', width: '8px', background: 'var(--terminal-green)' }}></div>
                        </div>

                        {/* Footer controls & stage movement */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {prev && (
                              <button 
                                className="btn-icon" 
                                style={{ width: '26px', height: '26px' }}
                                onClick={() => handleMoveColumn(task, prev)}
                                title={`Move back to ${prev}`}
                              >
                                <ArrowLeft size={13} />
                              </button>
                            )}
                            {next && (
                              <button 
                                className="btn-icon" 
                                style={{ width: '26px', height: '26px' }}
                                onClick={() => handleMoveColumn(task, next)}
                                title={`Advance to ${next}`}
                              >
                                <ArrowRight size={13} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button 
                              className="btn-icon" 
                              style={{ width: '26px', height: '26px' }}
                              onClick={() => onEditTask(task)}
                              title="Edit operation"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button 
                              className="btn-icon" 
                              style={{ width: '26px', height: '26px' }}
                              onClick={() => { sounds.playDelete(); onDeleteTask(task.id); }}
                              title="Purge operation"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
