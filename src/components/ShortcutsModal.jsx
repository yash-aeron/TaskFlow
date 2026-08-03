import React from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

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
      <div className={isPersona ? "modal-content persona-card" : "modal-content nerv-frame"} style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={18} style={{ color: isPersona ? '#00e5ff' : '#ff0000' }} />
            <h3 style={{ fontSize: '14px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000' }}>
              {isPersona ? "PERSONA COMMAND MANUAL" : "NERV TACTICAL OPERATIONS MANUAL // 警報"}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {shortcuts.map((s) => (
            <div 
              key={s.key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#000000', border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>{s.description}</span>
              <kbd style={{ background: isPersona ? '#e60012' : '#ff6600', color: '#ffffff', padding: '2px 6px', fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font)' }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
