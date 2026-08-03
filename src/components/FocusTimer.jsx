import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const MODES = {
  work: { label: 'Focus Work', duration: 25 * 60, color: '#6366f1' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: '#10b981' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: '#3b82f6' }
};

export default function FocusTimer({ tasks, initialTask, onLogFocusTime }) {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTask?.id || '');
  const [completedSessions, setCompletedSessions] = useState(0);

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

        // Log 25 minutes to task if selected
        if (selectedTaskId) {
          onLogFocusTime(selectedTaskId, 25);
        }

        // Switch to break
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Pomodoro Focus Studio</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Boost deep work output with timed focus intervals.
        </p>
      </div>

      {/* Mode Selectors */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-glass)', padding: '6px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
        {Object.keys(MODES).map((m) => (
          <button
            key={m}
            className={`pill-btn ${mode === m ? 'active' : ''}`}
            onClick={() => changeMode(m)}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle Glass Card */}
      <div className="card" style={{ width: '100%', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative' }}>
        {/* Task Selection Dropdown */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '6px' }}>Focus Target Task</label>
          <select
            className="form-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">-- Select a task to focus on --</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Display Timer */}
        <div 
          style={{ 
            fontSize: '4.5rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-heading)',
            letterSpacing: '2px',
            color: currentModeInfo.color,
            textShadow: `0 0 20px ${currentModeInfo.color}40`
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="progress-bar-container" style={{ width: '80%', height: '8px' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: currentModeInfo.color }} />
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <button className="btn-icon" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={20} />
          </button>

          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-full)' }}
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button 
            className="btn-icon" 
            onClick={() => {
              setTimeLeft(0);
            }} 
            title="Skip Interval"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
          <Award size={20} style={{ color: 'var(--accent-light)', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{completedSessions}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Sessions Completed</div>
        </div>

        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
          <Clock size={20} style={{ color: '#10b981', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{completedSessions * 25}m</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Total Focused Time</div>
        </div>
      </div>
    </div>
  );
}
