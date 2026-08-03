import React from 'react';
import { Plus, ArrowLeft, ArrowRight, CheckCircle, Clock, Calendar, Edit3, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const COLUMNS = [
  { id: 'backlog', title: '>> BACKLOG', color: '#6b7280', icon: '📦' },
  { id: 'todo', title: '>> TO DO', color: '#3b82f6', icon: '📋' },
  { id: 'in_progress', title: '>> IN PROGRESS', color: '#f59e0b', icon: '⚡' },
  { id: 'completed', title: '>> COMPLETED', color: '#10b981', icon: '✅' }
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
    return categories.find(c => c.id === catId) || { name: 'General', color: '#6366f1' };
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
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);

        return (
          <div key={col.id} className="kanban-column">
            <div className="column-header">
              <div 
                className="column-title" 
                style={{ 
                  fontFamily: 'var(--font)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.06em' 
                }}
              >
                <span>{col.icon}</span>
                <span>{col.title}</span>
                <span className="badge" style={{ marginLeft: '4px' }}>{colTasks.length}</span>
              </div>
              
              <button 
                className="btn-icon" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => { sounds.playClick(); onOpenNewTask(); }}
                title="Add task to this view"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {colTasks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)' }}>
                  Empty column
                </div>
              ) : (
                colTasks.map((task) => {
                  const cat = getCategoryInfo(task.category);
                  const prev = getPrevStatus(task.status);
                  const next = getNextStatus(task.status);

                  return (
                    <div key={task.id} className="card" style={{ padding: '14px', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <span 
                          className="category-tag" 
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color, fontSize: '0.7rem', padding: '2px 8px' }}
                        >
                          {cat.name}
                        </span>

                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '8px' }}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="task-desc" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          {task.description}
                        </p>
                      )}

                      {/* Footer controls & stage movement */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {prev && (
                            <button 
                              className="btn-icon" 
                              style={{ width: '26px', height: '26px' }}
                              onClick={() => handleMoveColumn(task, prev)}
                              title={`Move to ${prev}`}
                            >
                              <ArrowLeft size={13} />
                            </button>
                          )}
                          {next && (
                            <button 
                              className="btn-icon" 
                              style={{ width: '26px', height: '26px' }}
                              onClick={() => handleMoveColumn(task, next)}
                              title={`Move to ${next}`}
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
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            className="btn-icon" 
                            style={{ width: '26px', height: '26px' }}
                            onClick={() => { sounds.playDelete(); onDeleteTask(task.id); }}
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
  );
}
