import React from 'react';
import { Plus } from 'lucide-react';

export default function HeroHeader({ tasks, onOpenNewTask }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const active = tasks.length - completed;

  return (
    <div className="controls-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
      <div>
        <h2 style={{ fontSize: '16px' }}>Tasks</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {tasks.length === 0 ? 'No tasks yet' : `${active} active · ${completed} done`}
        </span>
      </div>
      <button className="btn btn-primary" onClick={onOpenNewTask}>
        <Plus size={14} />
        <span>New Task</span>
      </button>
    </div>
  );
}
