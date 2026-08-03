import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Award, Clock, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const MODES = {
  work: { label: 'SYNC', duration: 25 * 60, color: '#ff0000' },
  shortBreak: { label: 'STANDBY', duration: 5 * 60, color: '#00ff66' },
  longBreak: { label: 'COOLDOWN', duration: 15 * 60, color: '#00ffcc' }
};

export default function FocusTimer({ tasks = [], initialTask, onLogFocusTime, themeMode = 'nerv' }) {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTask?.id || '');
  const [completedSessions, setCompletedSessions] = useState(0);

  const isPersona = themeMode === 'persona';

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    }
  }, [initialTask]);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      sounds.playComplete();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setIsActive(false);
      
      if (mode === 'work') {
        setCompletedSessions(prev => prev + 1);
        if (selectedTaskId && onLogFocusTime) {
          onLogFocusTime(selectedTaskId, 25);
        }
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, mode, selectedTaskId, onLogFocusTime]);

  const changeMode = (newMode) => {
    sounds.playClick();
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsActive(false);
  };

  const toggleTimer = () => {
    sounds.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsActive(false);
    setTimeLeft(MODES[mode].duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentModeInfo = MODES[mode];
  const progressPercent = Math.round(((currentModeInfo.duration - timeLeft) / currentModeInfo.duration) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
        {!isPersona && <div className="hazard-stripe-red" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px' }} />}
        <h2 style={{ fontSize: '20px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000', letterSpacing: '0.12em', margin: 0 }}>
          {isPersona ? "PERSONA 3 RELOAD // FOCUS CLOCK 4:59:10" : "ENTRY PLUG SYNCHRONIZATION TIMER // 内部・外部"}
        </h2>
        <p style={{ fontSize: '11px', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', marginTop: '4px', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
          {isPersona ? "VELVET ROOM DEEP FOCUS MATRIX // TAKES YOUR TIME" : "MAGI SYSTEM TOKYO-3 NERV // SYNC SEQUENCE ACTIVE"}
        </p>
      </div>

      {/* Mode Selectors */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {Object.keys(MODES).map((m) => (
          <button
            key={m}
            className={`pill-btn ${mode === m ? 'active' : ''}`}
            onClick={() => changeMode(m)}
            style={isPersona ? {
              padding: '6px 18px', fontSize: '12px', fontFamily: "'Impact', sans-serif",
              background: mode === m ? '#e60012' : '#0e0f24',
              color: mode === m ? '#ffffff' : '#00e5ff',
              border: '2px solid #00e5ff',
              transform: 'skewX(-10deg)',
              boxShadow: mode === m ? '-3px 3px 0px #00e5ff' : 'none'
            } : {
              background: mode === m ? '#ff0000' : '#0d0d0d',
              color: '#ffffff',
              border: mode === m ? '1px solid #ffffff' : '1px solid #ff8800'
            }}
          >
            {isPersona ? (m === 'work' ? 'SKiLL FOCUS' : m === 'shortBreak' ? 'STANDBY' : 'RELOAD') : MODES[m].label}
          </button>
        ))}
      </div>

      {/* Sleek Integrated Focus Card */}
      <div 
        className={isPersona ? "persona-card" : "card nerv-frame"} 
        style={{
          padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          background: isPersona ? '#0e0f24' : '#000000',
          border: isPersona ? '2px solid #00e5ff' : '1px solid #ff8800'
        }}
      >
        {/* Target Dropdown */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px', color: isPersona ? '#00e5ff' : '#ff8800' }}>
            <Target size={14} />
            <span>{isPersona ? "[ TARGET MISSION ] SELECT MISSION TARGET" : "[ TARGET ACQUISITION ] SELECT ANGEL / OPERATION TARGET"}</span>
          </label>
          <select
            className="form-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={isPersona ? { background: '#04040c', color: '#00e5ff', border: '2px solid #00e5ff' } : { background: '#0a0a0a', color: '#ffffff', border: '1px solid #ff8800' }}
          >
            <option value="">{isPersona ? "-- SELECT MISSION TARGET --" : "-- SELECT ANGEL OPERATION --"}</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Big Clock Display */}
        <div 
          style={{ 
            fontSize: '5.2rem', 
            fontWeight: 900, 
            fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)',
            letterSpacing: '6px',
            color: isPersona ? '#00e5ff' : currentModeInfo.color,
            textShadow: isPersona ? '-5px 5px 0px #e60012' : `0 0 25px ${currentModeInfo.color}`,
            background: isPersona ? '#04040c' : '#080808',
            border: isPersona ? '2px solid #00e5ff' : '2px solid #ff0000',
            padding: '16px 32px',
            width: '100%',
            textAlign: 'center',
            boxShadow: isPersona ? '-6px 6px 0px #e60012' : '0 0 15px rgba(255,0,0,0.3)'
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Action Controls Directly Under Clock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', width: '100%' }}>
          <button 
            className="btn-icon" 
            onClick={resetTimer} 
            title="Reset Timer"
            style={{
              width: '44px', height: '44px',
              background: isPersona ? '#04040c' : '#0d0d0d',
              border: isPersona ? '2px solid #00e5ff' : '1px solid #ff8800',
              color: isPersona ? '#00e5ff' : '#ff8800',
              transform: isPersona ? 'skewX(-6deg)' : 'none'
            }}
          >
            <RotateCcw size={20} />
          </button>

          <button 
            className={`btn btn-primary ${!isPersona ? 'hazard-stripe-red' : ''}`}
            style={{ 
              padding: '14px 44px', fontSize: '1.25rem',
              background: isPersona ? '#e60012' : '#ff0000',
              color: '#ffffff',
              border: isPersona ? '2px solid #ffffff' : '1px solid #ffffff',
              boxShadow: isPersona ? '-5px 5px 0px #00e5ff' : '0 0 16px rgba(255,0,0,0.8)',
              fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)',
              transform: isPersona ? 'skewX(-10deg)' : 'none',
              letterSpacing: '0.12em'
            }}
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
            <span>{isActive ? 'PAUSE' : (isPersona ? 'ALL-OUT ATTACK' : 'EXECUTE')}</span>
          </button>

          <button 
            className="btn-icon" 
            onClick={() => setTimeLeft(0)} 
            title="Skip Interval"
            style={{
              width: '44px', height: '44px',
              background: isPersona ? '#04040c' : '#0d0d0d',
              border: isPersona ? '2px solid #00e5ff' : '1px solid #ff8800',
              color: isPersona ? '#00e5ff' : '#ff8800',
              transform: isPersona ? 'skewX(-6deg)' : 'none'
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Chevron Progress Bar */}
        <div className="chevron-bar-container" style={{ display: 'flex', gap: '3px', width: '100%', height: '12px', marginTop: '6px' }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const isActiveSegment = i < Math.round((progressPercent / 100) * 16);
            return (
              <div 
                key={i} 
                className={`chevron-segment ${isActiveSegment ? (isPersona ? 'active-green' : 'active-red') : ''}`}
                style={{ flex: 1, height: '12px', background: isActiveSegment ? (isPersona ? '#00e5ff' : '#ff0000') : '#222222' }}
              />
            );
          })}
        </div>
      </div>

      {/* Session Stats */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
          <Award size={22} style={{ color: isPersona ? '#00e5ff' : '#ff8800', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#ffffff' : '#ff0000' }}>
            {completedSessions}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>SESSIONS COMPLETED</div>
        </div>

        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
          <Clock size={22} style={{ color: '#00ff66', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: '#00ff66' }}>
            {completedSessions * 25}M
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>TOTAL FOCUS TIME</div>
        </div>
      </div>
    </div>
  );
}
