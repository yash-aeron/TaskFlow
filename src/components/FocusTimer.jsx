import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const MODES = {
  work: { label: 'SYNC', duration: 25 * 60, color: '#ff0000' },
  shortBreak: { label: 'STANDBY', duration: 5 * 60, color: '#00ff66' },
  longBreak: { label: 'COOLDOWN', duration: 15 * 60, color: '#ff6600' }
};

function OscilloscopeFeed({ isActive }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const lobes = [
      { name: 'TEMPORAL LOBE', freq: 0.035, amp: 12, speedMult: 1.0 },
      { name: 'AMYGDALA', freq: 0.07, amp: 16, speedMult: 1.4 },
      { name: 'HIPPOCAMPUS', freq: 0.02, amp: 10, speedMult: 0.8 },
      { name: 'PARIETAL LOBE', freq: 0.05, amp: 14, speedMult: 1.2 }
    ];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const channelHeight = height / 4;

      lobes.forEach((lobe, i) => {
        const yCenter = i * channelHeight + channelHeight / 2;

        // Channel Divider Line
        if (i > 0) {
          ctx.beginPath();
          ctx.strokeStyle = '#003311';
          ctx.lineWidth = 1;
          ctx.moveTo(0, i * channelHeight);
          ctx.lineTo(width, i * channelHeight);
          ctx.stroke();
        }

        // Center dashed baseline
        ctx.beginPath();
        ctx.strokeStyle = '#00260e';
        ctx.setLineDash([3, 3]);
        ctx.moveTo(0, yCenter);
        ctx.lineTo(width, yCenter);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#00ff66';
        ctx.fillText(`[ ${lobe.name} ] ${isActive ? 'SYNC: 99.8%' : 'SYNC: 40.0%'}`, 8, i * channelHeight + 13);

        // Sine waveform
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 4;

        const currentPhase = phase * 0.05 * lobe.speedMult * (isActive ? 2.0 : 0.5);

        for (let x = 0; x < width; x += 2) {
          let noise = 0;
          if (isActive && Math.sin(x * 0.1 + phase * 0.2) > 0.8) {
            noise = (Math.random() - 0.5) * 6;
          }
          const y = yCenter + Math.sin(x * lobe.freq + currentPhase) * lobe.amp + noise;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      phase += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  return (
    <div className="nerv-frame" style={{ width: '100%', background: '#000000', padding: '14px', border: '1px solid #005522' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #00441b', paddingBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: '#00ff66', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#00ff66' }}>///</span> OSCILLOSCOPE SIGNAL FEED // BRAIN WAVE HARMONICS
        </span>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font)', color: isActive ? '#00ff66' : '#00aa44' }}>
          {isActive ? '[ PATTERN: BLUE (ACTIVE) ]' : '[ PATTERN: STANDBY ]'}
        </span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={560} 
        height={220} 
        style={{ width: '100%', height: '220px', display: 'block', background: '#000b04', border: '1px solid #003311' }} 
      />
    </div>
  );
}

export default function FocusTimer({ tasks = [], initialTask, onLogFocusTime }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      
      {/* Heading & Hazard Accent Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div className="hazard-stripe-yellow" style={{ height: '4px', width: '100%', marginBottom: '12px' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.15em', fontSize: '1.35rem', color: '#ffffff', textShadow: '0 0 10px rgba(255, 0, 0, 0.6)', margin: 0 }}>
          ENTRY PLUG SYNCHRONIZATION TIMER // 内部・外部
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--nerv-amber)', fontFamily: 'var(--font)', letterSpacing: '0.08em', marginTop: '6px', margin: '6px 0 0 0' }}>
          MAGI SYSTEM TOKYO-3 NERV // SYNC SEQUENCE ACTIVE
        </p>
      </div>

      {/* Mode Selectors */}
      <div style={{ display: 'flex', gap: '10px', background: '#080808', padding: '6px', border: '1px solid var(--border)', width: '100%', justifyContent: 'center' }}>
        {Object.keys(MODES).map((m) => {
          const isSelected = mode === m;
          return (
            <button
              key={m}
              onClick={() => changeMode(m)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                background: isSelected ? MODES[m].color : 'transparent',
                color: isSelected ? (m === 'shortBreak' ? '#000000' : '#ffffff') : 'var(--text-muted)',
                border: `1px solid ${isSelected ? MODES[m].color : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 12px ${MODES[m].color}80` : 'none'
              }}
            >
              [ {MODES[m].label} ]
            </button>
          );
        })}
      </div>

      {/* Timer Main Glass Card */}
      <div className="nerv-frame" style={{ width: '100%', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: '#000000', border: `1px solid ${currentModeInfo.color}` }}>
        
        {/* Target Task Dropdown */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '6px', color: 'var(--nerv-amber)', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)', fontSize: '0.78rem' }}>
            [ TARGET ACQUISITION ] SELECT ANGEL / OPERATION TARGET
          </label>
          <select
            className="form-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={{
              width: '100%',
              background: '#050505',
              color: 'var(--terminal-green)',
              border: '1px solid var(--border-hover)',
              fontFamily: 'var(--font)',
              padding: '8px 12px',
              fontSize: '0.88rem',
              letterSpacing: '0.05em'
            }}
          >
            <option value="">&gt;&gt; SELECT TARGET OPERATION &lt;&lt;</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>{t.title.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Gradient Bar Above Timer Display */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.08em' }}>
            <span style={{ color: progressPercent <= 20 ? '#ff3333' : 'inherit' }}>STOP</span>
            <span style={{ color: progressPercent > 20 && progressPercent <= 40 ? '#ff6600' : 'inherit' }}>SLOW</span>
            <span style={{ color: progressPercent > 40 && progressPercent <= 60 ? '#ffe600' : 'inherit' }}>NORMAL</span>
            <span style={{ color: progressPercent > 60 && progressPercent <= 85 ? '#00ff66' : 'inherit' }}>RACING</span>
            <span style={{ color: progressPercent > 85 ? '#ff0000' : 'inherit' }}>DANGER</span>
          </div>
          <div style={{ position: 'relative', height: '8px', background: '#111111', border: '1px solid #333333' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #800000 0%, #ff6600 25%, #ffe600 50%, #00ff66 75%, #ff0000 100%)', opacity: 0.85 }} />
            {/* Moving Indicator Marker */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '-4px', 
                left: `${Math.min(Math.max(progressPercent, 1), 99)}%`, 
                width: '4px', 
                height: '14px', 
                background: '#ffffff', 
                boxShadow: '0 0 8px #ffffff',
                transform: 'translateX(-50%)',
                transition: 'left 0.4s ease-out'
              }} 
            />
          </div>
        </div>

        {/* Digital Timer Clock formatted like Image 2: [TIMER: 25:00] */}
        <div 
          style={{ 
            fontSize: '3.5rem', 
            fontWeight: 900, 
            fontFamily: 'var(--font-heading)',
            letterSpacing: '3px',
            color: currentModeInfo.color,
            textShadow: `0 0 25px ${currentModeInfo.color}80`,
            textAlign: 'center',
            background: '#000000',
            padding: '12px 24px',
            border: `2px solid ${currentModeInfo.color}`,
            width: '100%',
            maxWidth: '480px'
          }}
        >
          [TIMER: {formatTime(timeLeft)}]
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
          <button 
            className="btn-icon" 
            onClick={resetTimer} 
            title="Reset Sync Sequence"
            style={{ border: '1px solid var(--border)', padding: '10px', background: '#080808', color: '#ffffff', cursor: 'pointer' }}
          >
            <RotateCcw size={20} />
          </button>

          <button 
            className="btn btn-primary hazard-stripe-red" 
            style={{ padding: '10px 36px', fontSize: '1.05rem', border: '1px solid #ff0000', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={20} style={{ marginRight: '8px' }} /> : <Play size={20} style={{ marginRight: '8px' }} />}
            <span>{isActive ? 'INTERRUPT' : 'INITIALIZE'}</span>
          </button>

          <button 
            className="btn-icon" 
            onClick={() => setTimeLeft(0)} 
            title="Skip Interval"
            style={{ border: '1px solid var(--border)', padding: '10px', background: '#080808', color: '#ffffff', cursor: 'pointer' }}
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Oscilloscope Wave Simulation Section */}
      <OscilloscopeFeed isActive={isActive} />

      {/* Session Stats */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className="nerv-frame" style={{ flex: 1, textAlign: 'center', padding: '16px', background: '#000000', border: '1px solid var(--border)' }}>
          <Award size={20} style={{ color: 'var(--nerv-amber)', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>{completedSessions}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '2px' }}>SESSIONS SYNCED</div>
        </div>

        <div className="nerv-frame" style={{ flex: 1, textAlign: 'center', padding: '16px', background: '#000000', border: '1px solid var(--border)' }}>
          <Clock size={20} style={{ color: 'var(--terminal-green)', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>{completedSessions * 25}m</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '2px' }}>TOTAL SYNC TIME</div>
        </div>
      </div>

    </div>
  );
}
