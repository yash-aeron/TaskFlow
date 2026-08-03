import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div 
      className="toast-notification nerv-frame"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#000000',
        border: '2px solid #ff0000',
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'stretch',
        padding: 0,
        zIndex: 9999,
        maxWidth: '520px',
        overflow: 'hidden'
      }}
    >
      {/* Red Hazard Stripes on left edge */}
      <div 
        className="hazard-stripe-red" 
        style={{ 
          width: '18px', 
          flexShrink: 0, 
          borderRight: '1px solid #ff0000' 
        }} 
      />

      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <AlertTriangle size={20} style={{ color: '#ff0000', flexShrink: 0 }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '11px', 
            fontWeight: 900, 
            color: '#ff0000', 
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            [ <span className="kanji-text" style={{ fontFamily: 'var(--font-kanji)' }}>警報</span> ALERT // <span className="kanji-text" style={{ fontFamily: 'var(--font-kanji)' }}>使徒襲来</span> ]
          </div>

          <span style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#ffffff', 
            fontFamily: 'var(--font)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.04em' 
          }}>
            {toast.message}
          </span>
        </div>
      </div>

      <button 
        className="btn-icon" 
        style={{ 
          width: '36px', 
          height: '100%', 
          borderRadius: 0, 
          border: 'none', 
          borderLeft: '1px solid #330000', 
          background: 'transparent', 
          color: '#ff0000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }} 
        onClick={onClose}
        title="Dismiss warning"
      >
        <X size={16} />
      </button>
    </div>
  );
}
