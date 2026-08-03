import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    if (toast.type === 'success') return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
    if (toast.type === 'error') return <AlertCircle size={18} style={{ color: '#ef4444' }} />;
    return <Info size={18} style={{ color: 'var(--accent-light)' }} />;
  };

  return (
    <div className="toast-notification">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getIcon()}
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {toast.message}
        </span>
      </div>

      <button className="btn-icon" style={{ width: '24px', height: '24px' }} onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
