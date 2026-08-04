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
  onLoadDemoData,
  themeMode = 'nerv'
}) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [expandedTasks, setExpandedTasks] = useState({});

  const isPersona = themeMode === 'persona';

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

  const filteredTasks = tasks.filter(task => {
    const isCompleted = task.status === 'completed';
    const todayStr = new Date().toISOString().split('T')[0];

    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    if (filter === 'urgent') return task.priority === 'urgent' || task.priority === 'high';
    if (filter === 'today') return task.dueDate === todayStr;
    return true;
  });

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
    
    if (dateStr === today) return { label: 'TODAY', class: 'today' };
    if (dateStr === tomorrow) return { label: 'TOMORROW', class: 'tomorrow' };
    if (dateStr < today) return { label: 'OVERDUE', class: 'overdue' };
    return { label: dateStr, class: 'normal' };
  };

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  const renderPriorityBadge = (priority) => {
    if (isPersona) {
      return (
        <span className={`priority-badge ${priority}`}>
          {priority?.toUpperCase()}
        </span>
      );
    }

    switch (priority) {
      case 'urgent':
        return (
          <span className="priority-badge urgent">
            [ <span className="kanji-text">警報</span> URGENT ]
          </span>
        );
      case 'high':
        return (
          <span className="priority-badge high">
            [ <span className="kanji-text">警報</span> HIGH ]
          </span>
        );
      default:
        return <span className={`priority-badge ${priority}`}>[ {priority?.toUpperCase()} ]</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Filter and Sort Controls Bar */}
      <div className={isPersona ? "persona-card controls-header" : "controls-header nerv-frame"} style={{ padding: '12px' }}>
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
              >
                <span>{f.toUpperCase()}</span>
                <span>({count})</span>
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

          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font)' }}>
            SORT:
          </span>
          <select 
            className="form-select" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto' }}
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">DEADLINE</option>
            <option value="priority">THREAT LEVEL</option>
            <option value="title">DESIGNATION</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {sortedTasks.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Inbox size={32} />
            </div>
            <h3>{isPersona ? "NO MISSIONS FOUND" : "NO OPERATIONS FOUND"}</h3>
            <p>
              {tasks.length === 0 
                ? (isPersona ? "Your mission log is clear. Take your time or initialize a new task." : "Operations workspace clear. Initialize first operation or deploy sample data.")
                : "No tasks match your current filter parameters."}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onOpenNewTask}>
                <Plus size={16} />
                <span>{isPersona ? "NEW MISSION" : "INITIALIZE OP"}</span>
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

            return (
              <div 
                key={task.id} 
                className={`task-item ${isCompleted ? 'completed' : ''} ${isPersona ? 'persona-card' : ''}`}
              >
                <div className="task-header">
                  <div 
                    className={`checkbox-custom ${isCompleted ? 'checked' : ''}`}
                    onClick={(e) => handleTaskCheckbox(task, e)}
                  >
                    {isCompleted && <Check size={14} />}
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

                      {renderPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button className="btn-icon" onClick={() => onStartFocusTimer(task)} title="Start Focus Timer">
                      <Play size={14} />
                    </button>
                    <button className="btn-icon" onClick={() => onEditTask(task)} title="Edit Task">
                      <Edit3 size={14} />
                    </button>
                    <button className="btn-icon" onClick={() => { sounds.playDelete(); onDeleteTask(task.id); }} title="Delete Task">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtask Progress Bar */}
                {subtaskCount > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => toggleSubtasksExpand(task.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>SUB-GOALS ({completedSubtasks}/{subtaskCount})</span>
                      </div>
                      <span>{subtaskProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${subtaskProgress}%` }} />
                    </div>

                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '20px' }}>
                        {task.subtasks.map(st => (
                          <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                            <span style={{ color: st.completed ? 'var(--text-main)' : 'var(--text-subtle)' }}>
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: dateMeta.class === 'overdue' ? '#ff9900' : 'var(--text-muted)' }}>
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
