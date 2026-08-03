import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose, themeMode = 'nerv' }) {
  const isPersona = themeMode === 'persona';

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
      className={isPersona ? "toast-notification persona-card" : "toast-notification nerv-frame"}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        border: isPersona ? '2px solid #00e5ff' : '2px solid #ff0000',
        background: isPersona ? '#090918' : '#000000',
        color: isPersona ? '#00e5ff' : '#ffe600',
        boxShadow: isPersona ? '-4px 4px 0px #e60012' : '0 0 15px rgba(255, 0, 0, 0.5)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          padding: '2px 6px',
          background: isPersona ? '#e60012' : '#ff0000',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '10px',
          fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)'
        }}>
          {isPersona ? "[ ♠ ALERT ]" : "[ 警報 ALERT // 使徒襲来 ]"}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font)' }}>
          {toast.message}
        </span>
      </div>

      <button className="btn-icon" style={{ width: 22, height: 22, border: 'none', background: 'transparent', color: '#ffffff' }} onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
