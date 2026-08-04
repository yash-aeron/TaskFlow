import React, { useState } from 'react';
import { Flame, Plus, Check, Trash2 } from 'lucide-react';

export default function HabitTracker({ habits = [], onSaveHabit, onDeleteHabit, onToggleHabitDay, themeMode = 'nerv' }) {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const isPersona = themeMode === 'persona';

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const habit = {
      id: `habit-${Date.now()}`,
      title: newHabitTitle.trim(),
      frequency: newHabitFreq,
      createdAt: new Date().toISOString(),
      history: {}
    };

    onSaveHabit(habit);
    setNewHabitTitle('');
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      days.push({ dateStr, dayName });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const calculateStreak = (history = {}) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (history[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff9900', letterSpacing: '0.12em', margin: 0 }}>
            {isPersona ? "CONFIDANT SOCIAL LINKS // HABIT FREQUENCY MATRIX" : ">_ PATTERN RECOGNITION SYSTEM // 警報 使徒襲来"}
          </h2>
          <p style={{ fontSize: '11px', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', marginTop: '4px', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
            {isPersona ? "BUILD CONFIDANT RANKS & DAILY ROUTINES // TOKYO-3 SH06D" : "DAILY ROUTINE FREQUENCY MATRIX // TOKYO-3 NERV"}
          </p>
        </div>

        {/* Add Habit Form */}
        <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder={isPersona ? "NEW CONFIDANT / HABIT NAME..." : "[ 警報 ] ENTER NEW PATTERN NAME..."}
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            style={{ width: '220px' }}
          />
          <select
            className="form-select"
            value={newHabitFreq}
            onChange={(e) => setNewHabitFreq(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="daily">DAILY</option>
            <option value="weekly">WEEKLY</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <Plus size={14} />
            <span>{isPersona ? "RANK UP" : "[ 警報 ] INITIALIZE"}</span>
          </button>
        </form>
      </div>

      {/* Habits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {habits.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Flame size={28} />
            </div>
            <h3 style={{ color: isPersona ? '#00e5ff' : '#ff9900' }}>
              {isPersona ? "NO CONFIDANT SOCIAL LINKS" : "NO PATTERNS REGISTERED"}
            </h3>
            <p>
              {isPersona 
                ? "Start building your Phantom social links and daily routine habits to boost your stats." 
                : "Initialize your first routine pattern above."}
            </p>
          </div>
        ) : (
          habits.map(habit => {
            const streak = calculateStreak(habit.history);
            return (
              <div key={habit.id} className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Flame size={18} style={{ color: isPersona ? '#e60012' : '#ff9900' }} />
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)' }}>
                      {habit.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 900, padding: '2px 8px',
                      background: isPersona ? '#e60012' : '#000000',
                      color: '#ffffff',
                      border: isPersona ? '1px solid #00e5ff' : '1px solid #ff3ea5',
                      fontFamily: 'var(--font)'
                    }}>
                      {isPersona ? `[ RANK ${streak} ] STREAK` : `[ SH06D NERV ] STREAK: ${streak}D // ACTIVE`}
                    </span>

                    <button 
                      className="btn-icon"
                      onClick={() => onDeleteHabit(habit.id)}
                      title="Purge Habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 7-Day Completion Hex / Skew Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {last7Days.map(({ dateStr, dayName }) => {
                    const isDone = !!habit.history?.[dateStr];
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => onToggleHabitDay(habit.id, dateStr)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                          padding: '8px 4px', cursor: 'pointer',
                          background: isDone ? (isPersona ? '#00e5ff' : '#00ff66') : '#050505',
                          color: isDone ? '#000000' : '#ffffff',
                          border: `1px solid ${isDone ? '#ffffff' : (isPersona ? '#00e5ff' : 'var(--border-amber)')}`,
                          transform: isPersona ? 'skewX(-6deg)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font)' }}>{dayName}</span>
                        {isDone ? <Check size={14} style={{ fontWeight: 900 }} /> : <span style={{ fontSize: '10px', color: '#444' }}>•</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
