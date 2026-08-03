import React from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '[ CTRL ] + [ K ]', description: 'OPEN COMMAND PALETTE TERMINAL' },
    { key: '[ / ]', description: 'FOCUS QUICK SEARCH DIRECTIVE BAR' },
    { key: '[ CTRL ] + [ N ]', description: 'CREATE NEW TACTICAL TASK' },
    { key: '[ ? ]', description: 'SHOW TACTICAL OPERATIONS MANUAL' },
    { key: '[ ESC ]', description: 'TERMINATE ACTIVE OVERLAY / DIALOG' },
    { key: '[ TAB ]', description: 'CYCLE INTERACTIVE TACTICAL ELEMENTS' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="modal-content nerv-frame" 
        style={{ 
          maxWidth: '480px', 
          background: '#000000', 
          borderColor: '#ff0000',
          boxShadow: '0 0 25px rgba(255, 0, 0, 0.4)',
          padding: '20px'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top NERV Hazard Stripe Banner */}
        <div className="hazard-stripe-yellow" style={{ height: '4px', width: '100%', marginBottom: '14px' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333333', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#ff0000', color: '#ffffff', fontSize: '0.7rem', fontWeight: 900, padding: '2px 6px', fontFamily: 'var(--font)' }}>
              警報
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff0000', fontSize: '0.95rem', textShadow: '0 0 8px rgba(255,0,0,0.5)' }}>
              NERV TACTICAL OPERATIONS MANUAL // 警報
            </h3>
          </div>
          <button className="btn-icon" style={{ borderRadius: 0, borderColor: '#ff0000', color: '#ff0000' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          {shortcuts.map((s) => (
            <div 
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(255, 102, 0, 0.05)',
                border: '1px solid #330000',
                borderRadius: 0
              }}
            >
              <span style={{ fontSize: '0.82rem', color: '#ffffff', fontFamily: 'var(--font)', fontWeight: 600 }}>{s.description}</span>
              <kbd 
                style={{ 
                  background: 'rgba(255, 102, 0, 0.12)', 
                  border: '1px solid #ff6600', 
                  padding: '4px 10px', 
                  borderRadius: '0px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#ff6600',
                  fontFamily: 'var(--font)',
                  letterSpacing: '0.05em',
                  boxShadow: '0 0 6px rgba(255, 102, 0, 0.3)'
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
