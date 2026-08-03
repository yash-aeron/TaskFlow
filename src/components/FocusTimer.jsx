import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const MODES = {
  work: { label: 'SYNC', duration: 25 * 60, color: '#ff0000' },
  shortBreak: { label: 'STANDBY', duration: 5 * 60, color: '#00ff66' },
  longBreak: { label: 'COOLDOWN', duration: 15 * 60, color: '#00ffcc' }
};

export default function FocusTimer({ tasks = [], initialTask, onLogFocusTime }) {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTask?.id || '');
  const [completedSessions, setCompletedSessions] = useState(0);

  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    }
  }, [initialTask]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      sounds.playTimerEnd();

      if (mode === 'work') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setCompletedSessions(prev => prev + 1);

        if (selectedTaskId) {
          onLogFocusTime(selectedTaskId, 25);
        }

        if ((completedSessions + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(MODES.longBreak.duration);
        } else {
          setMode('shortBreak');
          setTimeLeft(MODES.shortBreak.duration);
        }
      } else {
        setMode('work');
        setTimeLeft(MODES.work.duration);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, selectedTaskId, completedSessions, onLogFocusTime]);

  const toggleTimer = () => {
    sounds.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    sounds.playClick();
    setIsActive(false);
    setTimeLeft(MODES[mode].duration);
  };

  const changeMode = (newMode) => {
    sounds.playClick();
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentModeInfo = MODES[mode];
  const progressPercent = Math.round(((currentModeInfo.duration - timeLeft) / currentModeInfo.duration) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
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
              padding: '6px 16px', fontSize: '12px', fontFamily: "'Impact', sans-serif",
              background: mode === m ? '#e60012' : '#090918',
              color: mode === m ? '#ffffff' : '#00e5ff',
              border: '2px solid #00e5ff',
              transform: 'skewX(-10deg)',
              boxShadow: mode === m ? '-3px 3px 0px #00e5ff' : 'none'
            } : {}}
          >
            {isPersona ? (m === 'work' ? 'SKiLL FOCUS' : m === 'shortBreak' ? 'STANDBY' : 'RELOAD') : MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle Glass Card */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{
        padding: '30px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
        background: isPersona ? 'linear-gradient(180deg, #090918 0%, #002266 100%)' : '#050505'
      }}>
        {/* Task Selection Dropdown */}
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '6px', color: isPersona ? '#00e5ff' : 'var(--nerv-amber)' }}>
            {isPersona ? "[ TARGET MISSION ] SELECT TARGET" : "[ TARGET ACQUISITION ] SELECT ANGEL / OPERATION TARGET"}
          </label>
          <select
            className="form-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={isPersona ? { background: '#090918', color: '#00e5ff', border: '2px solid #00e5ff' } : {}}
          >
            <option value="">{isPersona ? "-- SELECT MISSION TARGET --" : "-- SELECT ANGEL OPERATION --"}</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Display Timer */}
        <div 
          style={{ 
            fontSize: '5rem', 
            fontWeight: 900, 
            fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)',
            letterSpacing: '4px',
            color: isPersona ? '#00e5ff' : currentModeInfo.color,
            textShadow: isPersona ? '-4px 4px 0px #e60012' : `0 0 20px ${currentModeInfo.color}`,
            background: isPersona ? '#090918' : '#000000',
            border: isPersona ? '2px solid #00e5ff' : '2px solid #ff6600',
            padding: '10px 24px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Progress chevrons */}
        <div className="chevron-bar-container" style={{ width: '90%', height: '14px', margin: '4px 0' }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const isActive = i < Math.round((progressPercent / 100) * 14);
            return (
              <div 
                key={i} 
                className={`chevron-segment ${isActive ? (isPersona ? 'active-green' : 'active-red') : ''}`}
                style={{ flex: 1, height: '14px', background: isActive ? (isPersona ? '#00e5ff' : '#ff0000') : '#111111' }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
          <button className="btn-icon" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={18} />
          </button>

          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 40px', fontSize: '1.2rem' }}
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={22} /> : <Play size={22} />}
            <span>{isActive ? 'PAUSE' : 'EXECUTE'}</span>
          </button>

          <button 
            className="btn-icon" 
            onClick={() => setTimeLeft(0)} 
            title="Skip Interval"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
          <Award size={22} style={{ color: isPersona ? '#00e5ff' : '#ff6600', margin: '0 auto 6px' }} />
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
