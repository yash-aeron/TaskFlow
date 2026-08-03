import React, { useState } from 'react';
import { 
  CheckCircle, 
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
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onEditTask, 
  categories,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Filter and Sort Controls Bar */}
      <div className="controls-header">
        <div className="filter-group">
          {['all', 'active', 'completed', 'urgent', 'today'].map((f) => {
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
                className={`pill-btn ${filter === f ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setFilter(f); }}
              >
                <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>({count})</span>
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
              Clear Completed ({completedTasksCount})
            </button>
          )}

          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort by:</span>
          <select 
            className="form-select" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {sortedTasks.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Inbox size={32} />
            </div>
            <h3>No tasks found</h3>
            <p>
              {tasks.length === 0 
                ? "Your task workspace is completely clear. Create your first task or load sample demo data to explore."
                : "No tasks match your current filter criteria."}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onOpenNewTask}>
                <Plus size={16} />
                <span>Create Task</span>
              </button>

              {tasks.length === 0 && (
                <button className="btn btn-secondary" onClick={onLoadDemoData}>
                  <Sparkles size={16} />
                  <span>Load Sample Demo Data</span>
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
                className={`task-item priority-${task.priority} ${isCompleted ? 'completed' : ''}`}
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

                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
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

                {/* Subtask Progress Bar if available */}
                {subtaskCount > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => toggleSubtasksExpand(task.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>Subtasks ({completedSubtasks}/{subtaskCount})</span>
                      </div>
                      <span>{subtaskProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${subtaskProgress}%` }} />
                    </div>

                    {/* Subtask List Drawer */}
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
                        {task.estimatedMinutes}m est.
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
