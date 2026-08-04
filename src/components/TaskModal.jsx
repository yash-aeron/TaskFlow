import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function TaskModal({ 
  isOpen, onClose, onSave, taskToEdit, categories = [], themeMode = 'nerv'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isPersona = themeMode === 'persona';

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || (categories[0]?.id || 'work'));
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(taskToEdit.dueTime || '12:00');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory(categories[0]?.id || 'work');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setEstimatedMinutes(30);
      setTagsInput('');
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `subtask-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId) => {
    setSubtasks(subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDeleteSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playClick();

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const taskData = {
      id: taskToEdit?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: taskToEdit?.status || 'todo',
      priority,
      category,
      tags,
      subtasks,
      dueDate,
      dueTime,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
      actualMinutes: taskToEdit?.actualMinutes || 0,
      createdAt: taskToEdit?.createdAt || new Date().toISOString(),
      completedAt: taskToEdit?.completedAt || null,
    };

    onSave(taskData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={isPersona ? "modal-content persona-card" : "modal-content nerv-frame"} onClick={e => e.stopPropagation()}>
        {/* Banner */}
        <div style={{
          padding: '8px 12px',
          background: isPersona ? '#e60012' : '#ff9900',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '12px',
          fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)',
          letterSpacing: '0.1em',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          transform: isPersona ? 'skewX(-6deg)' : 'none'
        }}>
          <span>{isPersona ? "♠ PHANTOM DIRECTIVE // INITIALIZE" : "[ 警報 ALERT ] EMERGENCY OPERATION DIRECTIVE"}</span>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 900 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              {isPersona ? "MISSION DESIGNATION / CODE NAME" : "[ 識別 ] OPERATION DESIGNATION / CODE NAME"}
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder={isPersona ? "Enter mission title..." : "Enter operation title..."}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              {isPersona ? "BRIEFING & TACTICAL NOTES" : "[ 概要 ] BRIEFING & TACTICAL NOTES"}
            </label>
            <textarea 
              className="form-textarea" 
              rows={3}
              placeholder={isPersona ? "Enter tactical notes..." : "Enter briefing details..."}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Priority & Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {isPersona ? "THREAT / PRIORITY LEVEL" : "[ 警報 ] THREAT LEVEL"}
              </label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="urgent">URGENT (CRITICAL)</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isPersona ? "PARTY SECTOR / CATEGORY" : "[ 部署 ] SECTOR / DIVISION"}
              </label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {isPersona ? "DEADLINE DATE" : "[ 期限 ] DEADLINE DATE"}
              </label>
              <input 
                type="date" 
                className="form-input" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {isPersona ? "TIMECODE" : "[ 時間 ] TIMECODE"}
              </label>
              <input 
                type="time" 
                className="form-input" 
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              {isPersona ? "TAGS & MARKERS" : "[ 識別子 ] MARKERS & TAGS"}
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. boss, palace, urgent (comma separated)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label className="form-label">
              {isPersona ? "SUB-GOALS / SUBTASKS" : "[ サブ ] SUB-OPERATIONS"}
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSubtask}>
                <Check size={14} />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {subtasks.map(st => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#000000', border: '1px solid var(--border)' }}>
                    <span 
                      style={{ cursor: 'pointer', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-tertiary)' : '#ffffff' }}
                      onClick={() => handleToggleSubtask(st.id)}
                    >
                      {st.completed ? '✓' : '•'} {st.title}
                    </span>
                    <button type="button" className="btn-icon" style={{ width: 20, height: 20 }} onClick={() => handleDeleteSubtask(st.id)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {isPersona ? "ABORT" : "[ 警報 ] ABORT"}
            </button>
            <button type="submit" className="btn btn-primary">
              {isPersona ? "DEPLOY MISSION" : "[ 使徒襲来 ] DEPLOY OPERATION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
