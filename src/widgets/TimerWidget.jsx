import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';

export default function TimerWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progress = Math.round(((25 * 60 - timeLeft) / (25 * 60)) * 100);

  const handleClose = () => {
    if (window.widgetAPI) window.widgetAPI.closeWidget();
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <Timer size={12} />
          <span>// SYNC TIMER</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body" style={{ alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ 
          fontSize: 36, fontWeight: 800, 
          fontFamily: "'Orbitron', sans-serif", 
          letterSpacing: 3,
          color: isActive ? '#8B5CF6' : '#d8d8ff',
          textShadow: isActive ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
          transition: 'color 0.3s, text-shadow 0.3s'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Sync progress bar */}
        <div style={{ width: '80%', height: 3, background: '#1a1a3e', border: '1px solid #2a2a5e', borderRadius: 0 }}>
          <div style={{ 
            height: '100%', width: `${progress}%`, 
            background: isActive ? '#8B5CF6' : '#FF6B00',
            boxShadow: isActive ? '0 0 8px rgba(139,92,246,0.3)' : 'none',
            transition: 'width 0.3s'
          }} />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="widget-btn" onClick={() => setIsActive(!isActive)} style={{
            boxShadow: isActive ? '0 0 12px rgba(139,92,246,0.3)' : 'none'
          }}>
            {isActive ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button className="widget-btn" style={{ background: '#1a1a3e', borderColor: '#2a2a5e' }} onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
