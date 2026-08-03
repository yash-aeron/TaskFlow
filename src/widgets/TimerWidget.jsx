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

  const handleClose = () => {
    if (window.widgetAPI) window.widgetAPI.closeWidget();
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <Timer size={13} style={{ color: '#30a46c' }} />
          <span>Focus Timer</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={13} /></button>
      </div>

      <div className="widget-body" style={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>
          {formatTime(timeLeft)}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="widget-btn" onClick={() => setIsActive(!isActive)}>
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="widget-btn" style={{ background: '#252525' }} onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
