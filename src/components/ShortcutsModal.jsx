import React from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', description: 'Open command palette' },
    { key: '/', description: 'Focus quick search bar' },
    { key: 'Ctrl + N', description: 'Create new task' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close active modal / dialog' },
    { key: 'Tab', description: 'Navigate interactive elements' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={20} style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              NERV OPERATIONS MANUAL
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {shortcuts.map((s) => (
            <div 
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{s.description}</span>
              <kbd 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--eva-orange)', 
                  borderColor: 'var(--eva-orange)',
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font)'
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
