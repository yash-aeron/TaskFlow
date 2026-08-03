import React from 'react';
import { Plus } from 'lucide-react';

export default function HeroHeader({ tasks = [], onOpenNewTask }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const active = tasks.length - completed;

  return (
    <div className="controls-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
      <div>
        <h2 style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>&gt;_ OPERATIONS LOG</h2>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font)', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
          {tasks.length === 0 ? 'NO OPERATIONS REGISTERED' : `[ACTIVE: ${active}] [COMPLETE: ${completed}]`}
        </span>
      </div>
      <button className="btn btn-primary" onClick={onOpenNewTask}>
        <Plus size={14} />
        <span>NEW OP</span>
      </button>
    </div>
  );
}
