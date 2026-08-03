import React, { useState } from 'react';
import { Flame, Check, Plus, Trash2, Calendar, Target, AlertTriangle, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export default function HabitTracker({ habits = [], onSaveHabit, onDeleteHabit, onToggleHabitDay }) {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('health');
  const [targetDays, setTargetDays] = useState(7);
  const [showAddForm, setShowAddForm] = useState(false);

  // Generate last 7 days array
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - 86400000 * i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateStr, dayName, isToday: i === 0 });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getStreak = (history) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - 86400000 * i).toISOString().split('T')[0];
      if (history[d]) {
        streak++;
      } else if (i > 0) { // allow today to not be checked yet
        break;
      }
    }
    return streak;
  };

  const handleDayCheck = (habitId, dateStr, currentVal) => {
    sounds.playSubtask();
    if (!currentVal) {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
    onToggleHabitDay(habitId, dateStr);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit = {
      id: `habit-${Date.now()}`,
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      targetDays: Number(targetDays),
      history: {}
    };

    sounds.playComplete();
    onSaveHabit(newHabit);
    setNewHabitTitle('');
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#000000', padding: '4px' }}>
      {/* Top NERV Caution Banner */}
      <div className="hazard-stripe-yellow" style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>警報 // EMERGENCY PATTERN RECOGNITION SYSTEM</span>
        <span>TOKYO-3 NERV HQ // CODE: SH06D</span>
      </div>

      <div className="controls-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--nerv-red)', fontSize: '1.4rem', letterSpacing: '0.1em', margin: 0 }}>
            &gt;_ PATTERN RECOGNITION SYSTEM // <span className="kanji-text">警報 使徒襲来</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--nerv-amber)', fontFamily: 'var(--font)', margin: '4px 0 0 0', letterSpacing: '0.05em' }}>
            DAILY ROUTINE FREQUENCY MATRIX // TOKYO-3 NERV
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { sounds.playClick(); setShowAddForm(!showAddForm); }}
          style={{ background: showAddForm ? '#660000' : 'var(--nerv-red)', border: '1px solid #ffffff', color: '#ffffff', padding: '8px 16px', fontWeight: 900 }}
        >
          <Plus size={18} />
          <span>{showAddForm ? '[ 警報 ] CANCEL INITIALIZATION' : '[ 警報 ] INITIALIZE NEW PATTERN'}</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form className="nerv-frame card" onSubmit={handleAddHabit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderColor: 'var(--nerv-red)' }}>
          <div className="hazard-stripe-red" style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em' }}>
            [ 警報 ] CREATE NEW PATTERN // 内部データ
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
              <label className="form-label" style={{ color: 'var(--nerv-amber)', fontSize: '11px', fontWeight: 800 }}>PATTERN TITLE / 識別名</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tactical Sync Routine"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                required
                autoFocus
                style={{ background: '#000000', borderColor: 'var(--nerv-amber)', color: 'var(--terminal-green)' }}
              />
            </div>
            <div className="form-group" style={{ width: '180px' }}>
              <label className="form-label" style={{ color: 'var(--nerv-amber)', fontSize: '11px', fontWeight: 800 }}>TARGET FREQUENCY</label>
              <select className="form-select" value={targetDays} onChange={(e) => setTargetDays(e.target.value)} style={{ background: '#080500', borderColor: 'var(--nerv-amber)', color: 'var(--terminal-green)' }}>
                <option value={7}>7D / WEEK [MAX]</option>
                <option value={5}>5D / WEEK [HIGH]</option>
                <option value={3}>3D / WEEK [MID]</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary">
              SAVE PATTERN // 登録
            </button>
          </div>
        </form>
      )}

      {/* Habits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {habits.length === 0 ? (
          <div className="nerv-frame card" style={{ textAlign: 'center', padding: '40px', color: 'var(--nerv-amber)', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            [ 警報 ] NO PATTERNS LOGGED YET. CLICK "[ 警報 ] INITIALIZE NEW PATTERN" TO START BUILDING YOUR STREAK!
          </div>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.history || {});
            const completedCountIn7 = last7Days.filter(d => habit.history?.[d.dateStr]).length;

            return (
              <div key={habit.id} className="nerv-frame card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#050505', border: '1px solid var(--border-amber)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'rgba(255, 102, 0, 0.15)', border: '1px solid var(--nerv-amber)', color: 'var(--nerv-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '0.08em', margin: 0 }}>
                        {habit.title}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
                        TARGET: {habit.targetDays}D/WEEK // ROUTINE FREQUENCY ({completedCountIn7}/{habit.targetDays})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* SH06D NERV Streak Readout */}
                    <div style={{ 
                      padding: '6px 12px', 
                      background: '#120500', 
                      border: '1px solid var(--nerv-amber)', 
                      fontFamily: 'var(--font)',
                      fontWeight: 900, 
                      fontSize: '0.85rem',
                      color: 'var(--nerv-amber)',
                      boxShadow: '0 0 10px rgba(255, 102, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Flame size={16} color="var(--nerv-amber)" />
                      <span>[ SH06D NERV ] STREAK: {streak}D // ACTIVE</span>
                    </div>

                    <button 
                      className="btn-icon" 
                      onClick={() => { sounds.playDelete(); onDeleteHabit(habit.id); }}
                      title="PURGE PATTERN"
                      style={{ borderColor: 'var(--nerv-red)', color: 'var(--nerv-red)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Chevron Progress Visualizer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#000000', padding: '8px 12px', border: '1px solid #1f0a00' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--nerv-amber)', fontWeight: 800 }}>CYCLE SYNC:</span>
                  <div className="chevron-bar-container" style={{ flex: 1 }}>
                    {[...Array(7)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`chevron-segment ${i < completedCountIn7 ? 'active-green' : ''}`} 
                        style={{ flex: 1 }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--terminal-green)' }}>
                    {Math.round((completedCountIn7 / 7) * 100)}%
                  </span>
                </div>

                {/* SH06D Hex Grid Dot Matrix Completion Cells */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px dashed #331400' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--nerv-amber)', fontWeight: 800, letterSpacing: '0.08em' }}>
                    // 7-DAY BATTERY CPU HEX MATRIX GRID [CLICK TO TOGGLE DAY SYNC]
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', justifyItems: 'center' }}>
                    {last7Days.map((day) => {
                      const isChecked = !!habit.history?.[day.dateStr];

                      return (
                        <div 
                          key={day.dateStr}
                          onClick={() => handleDayCheck(habit.id, day.dateStr, isChecked)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            width: '100%'
                          }}
                        >
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: day.isToday ? 900 : 700, 
                            color: day.isToday ? 'var(--nerv-yellow)' : 'var(--text-subtle)',
                            fontFamily: 'var(--font)',
                            letterSpacing: '0.05em'
                          }}>
                            {day.dayName.toUpperCase()}{day.isToday ? '*' : ''}
                          </span>

                          {/* Battery/CPU Hex Grid Matrix Cell (Reference Image 3 SH06D NERV Phone Interface) */}
                          <div 
                            style={{
                              width: '46px',
                              height: '52px',
                              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                              background: isChecked ? '#00260d' : '#140600',
                              border: isChecked ? '2px solid #00ff66' : '1px solid #552200',
                              boxShadow: isChecked ? '0 0 12px rgba(0, 255, 102, 0.4)' : 'inset 0 0 8px rgba(0,0,0,0.8)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '5px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Hex dot matrix: green #00ff66 for completed, dark amber #331400 for empty */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: 'auto' }}>
                              {[...Array(6)].map((_, dotIdx) => (
                                <div 
                                  key={dotIdx}
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: isChecked ? '#00ff66' : '#331400',
                                    boxShadow: isChecked ? '0 0 6px #00ff66' : 'none',
                                    border: isChecked ? '1px solid #00ff66' : '1px solid #551c00',
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              ))}
                            </div>
                            <div style={{
                              fontSize: '7.5px',
                              fontWeight: 900,
                              color: isChecked ? '#00ff66' : '#993d00',
                              fontFamily: 'var(--font)',
                              letterSpacing: '0.04em',
                              lineHeight: 1
                            }}>
                              {isChecked ? 'SYNC' : 'NULL'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

