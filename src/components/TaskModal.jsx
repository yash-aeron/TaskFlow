import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, categories = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'work');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory(categories[0]?.id || 'work');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setEstimatedMinutes(30);
      setTags([]);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const setQuickDate = (offsetDays) => {
    sounds.playClick();
    const d = new Date(Date.now() + 86400000 * offsetDays);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddSubtask = (e) => {
    if (e.key === 'Enter' && subtaskInput.trim()) {
      e.preventDefault();
      setSubtasks([
        ...subtasks,
        { id: `st-${Date.now()}`, title: subtaskInput.trim(), completed: false }
      ]);
      setSubtaskInput('');
      sounds.playSubtask();
    }
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
    sounds.playSubtask();
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
    sounds.playDelete();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      dueDate,
      dueTime,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      actualMinutes: taskToEdit ? taskToEdit.actualMinutes : 0,
      tags,
      subtasks,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      completedAt: status === 'completed' ? (taskToEdit?.completedAt || new Date().toISOString()) : null
    };

    sounds.playComplete();
    onSave(taskData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Prepare Q4 Strategic Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add key context, bullet points, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select 
                className="form-select" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Est. Time (Minutes)</label>
              <input
                type="number"
                className="form-input"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Due Date</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="pill-btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setQuickDate(0)}>Today</button>
                  <button type="button" className="pill-btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setQuickDate(1)}>Tomorrow</button>
                  <button type="button" className="pill-btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setQuickDate(7)}>+1 Wk</button>
                </div>
              </div>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Time</label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="form-group">
            <label className="form-label">Checklist & Subtasks</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subtasks.map((st) => (
                <div 
                  key={st.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                    onClick={() => handleToggleSubtask(st.id)}
                  >
                    <div className={`checkbox-custom ${st.completed ? 'checked' : ''}`}>
                      {st.completed && <CheckCircle size={14} />}
                    </div>
                    <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-subtle)' : 'var(--text-main)', fontSize: '0.88rem' }}>
                      {st.title}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-icon" 
                    style={{ width: '26px', height: '26px' }}
                    onClick={() => handleRemoveSubtask(st.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <input
                type="text"
                className="form-input"
                placeholder="+ Add subtask (press Enter)"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={handleAddSubtask}
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
              {tags.map((tag) => (
                <span key={tag} className="tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  #{tag}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                </span>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Type tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
