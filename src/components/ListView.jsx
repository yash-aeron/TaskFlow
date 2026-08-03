import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Play,
  Plus,
  Sparkles,
  Inbox,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export default function ListView({ 
  tasks = [], 
  onToggleTask, 
  onDeleteTask, 
  onEditTask, 
  categories = [],
  onStartFocusTimer,
  onOpenNewTask,
  onLoadDemoData
}) {
  const [filter, setFilter] = useState('all'); // all, active, completed, urgent, today
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, title
  const [groupBy, setGroupBy] = useState('none'); // none, category, priority, status
  const [expandedTasks, setExpandedTasks] = useState({});

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'General', color: '#6366f1' };
  };

  const toggleSubtasksExpand = (taskId) => {
    sounds.playClick();
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleTaskCheckbox = (task, e) => {
    e.stopPropagation();
    const newCompleted = task.status !== 'completed';
    if (newCompleted) {
      sounds.playComplete();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sounds.playClick();
    }
    onToggleTask(task.id);
  };

  const handleClearCompleted = () => {
    sounds.playDelete();
    const completedIds = tasks.filter(t => t.status === 'completed').map(t => t.id);
    completedIds.forEach(id => onDeleteTask(id));
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    const isCompleted = task.status === 'completed';
    const todayStr = new Date().toISOString().split('T')[0];

    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    if (filter === 'urgent') return task.priority === 'urgent' || task.priority === 'high';
    if (filter === 'today') return task.dueDate === todayStr;
    return true;
  });

  // Sort tasks logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'priority') {
      const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return { label: 'Today', class: 'today' };
    if (dateStr === tomorrow) return { label: 'Tomorrow', class: 'tomorrow' };
    if (dateStr < today) return { label: 'Overdue', class: 'overdue' };
    return { label: dateStr, class: 'normal' };
  };

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  const renderThreatBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="priority-badge urgent" style={{ letterSpacing: '0.06em' }}>
            [ <span className="kanji-text">警報</span> URGENT ]
          </span>
        );
      case 'high':
        return (
          <span className="priority-badge high" style={{ letterSpacing: '0.06em' }}>
            [ <span className="kanji-text">警報</span> HIGH ]
          </span>
        );
      case 'medium':
        return (
          <span className="priority-badge medium" style={{ letterSpacing: '0.06em' }}>
            [ MEDIUM ]
          </span>
        );
      case 'low':
        return (
          <span className="priority-badge low" style={{ letterSpacing: '0.06em' }}>
            [ LOW ]
          </span>
        );
      default:
        return <span className="priority-badge low">[ {priority?.toUpperCase()} ]</span>;
    }
  };

  const getTaskLeftBorderColor = (task) => {
    if (task.status === 'completed') return 'var(--terminal-green)';
    switch (task.priority) {
      case 'urgent': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffe600';
      case 'low': return '#00ff66';
      default: return '#ff6600';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Filter and Sort Controls Bar */}
      <div className="controls-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="filter-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'active', 'completed', 'urgent', 'today'].map((f) => {
            const isActive = filter === f;
            const count = tasks.filter(t => {
              if (f === 'active') return t.status !== 'completed';
              if (f === 'completed') return t.status === 'completed';
              if (f === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
              if (f === 'today') return t.dueDate === new Date().toISOString().split('T')[0];
              return true;
            }).length;

            return (
              <button
                key={f}
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setFilter(f); }}
                style={{
                  fontFamily: 'var(--font)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '6px 12px',
                  background: isActive ? '#0a0900' : '#050505',
                  color: isActive ? '#ffe600' : 'var(--text-secondary)',
                  border: isActive ? '2px solid #ffe600' : '1px solid var(--border)',
                  boxShadow: isActive ? '0 0 10px rgba(255, 230, 0, 0.4)' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{f.toUpperCase()}</span>
                <span style={{ opacity: 0.8, fontSize: '0.75rem', color: isActive ? '#ffe600' : 'var(--text-tertiary)' }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {completedTasksCount > 0 && filter === 'completed' && (
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={handleClearCompleted}
            >
              PURGE COMPLETED ({completedTasksCount})
            </button>
          )}

          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font)' }}>SORT:</span>
          <select 
            className="form-select" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">DEADLINE</option>
            <option value="priority">THREAT LVL</option>
            <option value="title">DESIGNATION</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {sortedTasks.length === 0 ? (
          <div className="empty-state-card nerv-frame">
            <div className="empty-icon-wrapper">
              <Inbox size={32} />
            </div>
            <h3>NO OPERATIONS FOUND</h3>
            <p>
              {tasks.length === 0 
                ? "Operations workspace clear. Initialize first operation or deploy sample data."
                : "No operations match current filter parameters."}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onOpenNewTask}>
                <Plus size={16} />
                <span>INITIALIZE OP</span>
              </button>

              {tasks.length === 0 && (
                <button className="btn btn-secondary" onClick={onLoadDemoData}>
                  <Sparkles size={16} />
                  <span>DEPLOY SAMPLE DATA</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const cat = getCategoryInfo(task.category);
            const dateMeta = getRelativeDateLabel(task.dueDate);
            const isCompleted = task.status === 'completed';
            const subtaskCount = task.subtasks?.length || 0;
            const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
            const subtaskProgress = subtaskCount > 0 ? Math.round((completedSubtasks / subtaskCount) * 100) : 0;
            const isExpanded = expandedTasks[task.id];
            const leftBorderColor = getTaskLeftBorderColor(task);

            return (
              <div 
                key={task.id} 
                className={`task-item nerv-frame priority-${task.priority} ${isCompleted ? 'completed' : ''}`}
                style={{ borderLeft: `4px solid ${leftBorderColor}` }}
              >
                <div className="task-header">
                  {/* Hexagon Checkbox */}
                  <div 
                    className={`hex-checkbox ${isCompleted ? 'checked' : ''}`}
                    onClick={(e) => handleTaskCheckbox(task, e)}
                    style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title={isCompleted ? "Mark operational" : "Mark completed"}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
                      <polygon 
                        points="6,2 18,2 23,12 18,22 6,22 1,12" 
                        fill={isCompleted ? 'rgba(0, 255, 102, 0.25)' : '#0d0d0d'}
                        stroke={isCompleted ? '#00ff66' : '#ff6600'}
                        strokeWidth="2"
                      />
                    </svg>
                    {isCompleted ? (
                      <Check size={14} style={{ color: '#00ff66', strokeWidth: 3, zIndex: 2 }} />
                    ) : (
                      <div style={{ width: '6px', height: '6px', background: '#ff6600', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', zIndex: 2 }} />
                    )}
                  </div>

                  <div className="task-title-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="task-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      
                      <span className="category-tag">
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.color }} />
                        {cat.name}
                      </span>

                      {/* Threat Badge */}
                      {renderThreatBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => onStartFocusTimer(task)} 
                      title="Start Focus Timer for Task"
                    >
                      <Play size={15} />
                    </button>
                    <button className="btn-icon" onClick={() => onEditTask(task)} title="Edit Task">
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => { sounds.playDelete(); onDeleteTask(task.id); }} 
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subtask Progress Bar rendered as multi-segment chevrons /// /// /// */}
                {subtaskCount > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => toggleSubtasksExpand(task.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>SUB-OPS ({completedSubtasks}/{subtaskCount})</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font)', color: 'var(--nerv-amber)', fontWeight: 700 }}>
                        {subtaskProgress}%
                      </span>
                    </div>

                    {/* Chevron Bar */}
                    <div className="chevron-bar-container" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const threshold = ((idx + 1) / 12) * 100;
                        const isActive = subtaskProgress >= threshold || (subtaskProgress > 0 && idx === 0);
                        const isComplete = subtaskProgress === 100;
                        return (
                          <span
                            key={idx}
                            className={`chevron-segment ${isActive ? (isComplete ? 'active-green' : 'active-amber') : ''}`}
                            style={{
                              display: 'inline-block',
                              width: '12px',
                              height: '14px',
                              transform: 'skewX(-20deg)',
                              background: isActive ? (isComplete ? 'var(--terminal-green)' : 'var(--nerv-amber)') : '#1a1a1a',
                              border: `1px solid ${isActive ? 'transparent' : '#333333'}`,
                              boxShadow: isActive ? `0 0 6px ${isComplete ? 'var(--terminal-green-glow)' : 'var(--nerv-amber-glow)'}` : 'none'
                            }}
                          />
                        );
                      })}
                      <span style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--text-subtle)', marginLeft: '4px', letterSpacing: '0.1em' }}>
                        /// /// ///
                      </span>
                    </div>

                    {/* Subtask List Drawer */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '20px' }}>
                        {task.subtasks.map(st => (
                          <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                            <span style={{ color: st.completed ? 'var(--terminal-green)' : 'var(--text-subtle)' }}>
                              {st.completed ? '✓' : '•'}
                            </span>
                            <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-subtle)' : 'var(--text-main)' }}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="task-footer">
                  <div className="task-tags">
                    {task.tags?.map(t => (
                      <span key={t} className="tag-badge">#{t}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {task.estimatedMinutes > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {task.estimatedMinutes}M EST
                      </span>
                    )}

                    {dateMeta && (
                      <span 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: dateMeta.class === 'overdue' ? '#ef4444' : dateMeta.class === 'today' ? '#f97316' : 'var(--text-muted)',
                          fontWeight: dateMeta.class === 'overdue' || dateMeta.class === 'today' ? 700 : 500
                        }}
                      >
                        <Calendar size={13} />
                        {dateMeta.label} {task.dueTime ? `@ ${task.dueTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
