import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
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
      <div 
        className="modal-content nerv-frame" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#050505',
          border: '2px solid var(--nerv-red)',
          padding: '0',
          boxShadow: '0 0 35px rgba(255, 0, 0, 0.6)',
          maxWidth: '580px',
          width: '100%'
        }}
      >
        {/* Top Emergency Directive Banner */}
        <div 
          className="hazard-stripe-yellow" 
          style={{ 
            padding: '8px 16px', 
            fontWeight: 900, 
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #000000'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>[ 警報 ALERT ] EMERGENCY OPERATION DIRECTIVE</span>
          </div>
          <span style={{ fontSize: '0.75rem' }}>MAGI-OVERRIDE</span>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Title with Kanji */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', color: 'var(--nerv-red)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="kanji-text">第一種戦闘配置</span>
              <span>// {taskToEdit ? 'EDIT OPERATION DIRECTIVE' : 'INITIALIZE NEW OPERATION DIRECTIVE'}</span>
            </h2>
            <button className="btn-icon" onClick={onClose} title="Cancel Operation">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title field */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                [ 識別 ] OPERATION DESIGNATION / CODE NAME *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. OPERATION YASHIMA - SUB-LEVEL DEFENSE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description field */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                [ 概要 ] BRIEFING & TACTICAL NOTES
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Input tactical briefing, target vectors, or system notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Sector / Category & Threat Level / Priority */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                  [ 部署 ] SECTOR / DIVISION
                </label>
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
                <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                  [ 警報 ] THREAT LEVEL (URGENT / HIGH / MEDIUM / LOW)
                </label>
                <select 
                  className="form-select" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="urgent">🔴 CODE RED (URGENT)</option>
                  <option value="high">🟠 CODE AMBER (HIGH)</option>
                  <option value="medium">🟡 CODE YELLOW (MEDIUM)</option>
                  <option value="low">🟢 CODE GREEN (LOW)</option>
                </select>
              </div>
            </div>

            {/* System Status & Est Duration */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                  [ 状態 ] SYSTEM STATUS
                </label>
                <select 
                  className="form-select" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="backlog">MAGI MELCHIOR // BACKLOG</option>
                  <option value="todo">MAGI BALTHASAR // TO DO</option>
                  <option value="in_progress">MAGI CASPER // IN PROGRESS</option>
                  <option value="completed">DEPLOYED // COMPLETED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                  [ 概算 ] EST. DURATION (MINUTES)
                </label>
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

            {/* Deadline & Due Time */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em', margin: 0 }}>
                    [ 期限 ] DEADLINE TIMECODE
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" className="pill-btn btn-secondary" style={{ padding: '1px 6px', fontSize: '0.68rem' }} onClick={() => setQuickDate(0)}>Today</button>
                    <button type="button" className="pill-btn btn-secondary" style={{ padding: '1px 6px', fontSize: '0.68rem' }} onClick={() => setQuickDate(1)}>+1 Day</button>
                    <button type="button" className="pill-btn btn-secondary" style={{ padding: '1px 6px', fontSize: '0.68rem' }} onClick={() => setQuickDate(7)}>+1 Wk</button>
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
                <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                  [ 時間 ] TARGET TIME
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>

            {/* Checklist & Subtasks Section */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                [ 戦術 ] CHECKLIST & SUBTASKS
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {subtasks.map((st) => (
                  <div 
                    key={st.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#000000',
                      borderRadius: '0',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                      onClick={() => handleToggleSubtask(st.id)}
                    >
                      <div className={`checkbox-custom ${st.completed ? 'checked' : ''}`}>
                        {st.completed && <CheckCircle size={14} />}
                      </div>
                      <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-subtle)' : 'var(--text-main)', fontSize: '0.85rem' }}>
                        {st.title}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-icon" 
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => handleRemoveSubtask(st.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <input
                  type="text"
                  className="form-input"
                  placeholder="+ Add subtask objective (Press Enter)"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleAddSubtask}
                />
              </div>
            </div>

            {/* Markers & Tags Section */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--nerv-yellow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                [ 識別子 ] MARKERS & TAGS
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                {tags.map((tag) => (
                  <span key={tag} className="tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#1a0d00', border: '1px solid var(--nerv-amber)', color: 'var(--nerv-amber)', padding: '2px 8px', fontSize: '0.72rem' }}>
                    #{tag}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Type marker tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                [ 警報 ] ABORT
              </button>
              <button type="submit" className="btn btn-primary">
                [ 使徒襲来 ] {taskToEdit ? 'UPDATE DIRECTIVE' : 'DEPLOY OPERATION'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
