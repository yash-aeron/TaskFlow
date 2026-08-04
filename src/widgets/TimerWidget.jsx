import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

export default function TimerWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [themeMode, setThemeMode] = useState('nerv');

  useEffect(() => {
    if (window.widgetAPI) {
      const unsubscribe = window.widgetAPI.onDataUpdate(({ themeMode: newMode }) => {
        if (newMode) {
          setThemeMode(newMode);
          document.documentElement.setAttribute('data-theme-mode', newMode);
        }
      });
      return unsubscribe;
    }
  }, []);

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

  const isPersona = themeMode === 'persona';

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <span>{isPersona ? "♠ FOCUS TIMER 4:59:10" : "[ 内部 ] TIMER 4:59:10 [ 外部 ]"}</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body" style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 2, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', width: '100%', justifyContent: 'center' }}>
          <span style={{ background: isPersona ? '#00e5ff' : '#00ff66', color: '#000', padding: '1px 4px' }}>STOP</span>
          <span style={{ background: '#ffb000', color: '#000', padding: '1px 4px' }}>SLOW</span>
          <span style={{ background: isActive ? (isPersona ? '#e60012' : '#ff9900') : '#333333', color: '#fff', padding: '1px 4px' }}>RACING</span>
          <span style={{ background: isActive ? (isPersona ? '#e60012' : '#ff9900') : '#222', color: '#fff', padding: '1px 4px' }}>DANGER</span>
        </div>

        <div style={{ 
          fontSize: 34, fontWeight: 900, 
          fontFamily: isPersona ? 'Impact, sans-serif' : 'Orbitron, sans-serif', 
          letterSpacing: 2,
          color: isActive ? (isPersona ? '#e60012' : '#ff9900') : (isPersona ? '#00e5ff' : '#00ff66'),
          textShadow: isActive ? '0 0 15px rgba(255,153,0,0.8)' : '0 0 10px rgba(0,229,255,0.5)',
          background: isPersona ? '#090918' : '#000000',
          border: isPersona ? '1px solid #00e5ff' : '1px solid #ff3ea5',
          padding: '4px 12px',
          width: '100%',
          textAlign: 'center'
        }}>
          {formatTime(timeLeft)}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="widget-btn" onClick={() => setIsActive(!isActive)}>
            {isActive ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button className="widget-btn" style={{ background: isPersona ? '#090918' : '#000000', borderColor: isPersona ? '#00e5ff' : '#ff3ea5', color: isPersona ? '#00e5ff' : '#ff3ea5' }} onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
