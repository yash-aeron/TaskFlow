import React, { useState } from 'react';
import { Flame, Check, Plus, Trash2, Calendar, Target } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="controls-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>&gt;_ PATTERN RECOGNITION SYSTEM</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Build consistency and track your recurring daily routines.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { sounds.playClick(); setShowAddForm(!showAddForm); }}
        >
          <Plus size={18} />
          <span>{showAddForm ? 'Cancel' : 'NEW PATTERN'}</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form className="card" onSubmit={handleAddHabit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)' }}>CREATE NEW PATTERN</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Read 20 pages"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Days per Week</label>
              <select className="form-select" value={targetDays} onChange={(e) => setTargetDays(e.target.value)}>
                <option value={7}>7D / Week</option>
                <option value={5}>5D / Week</option>
                <option value={3}>3D / Week</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">Save Pattern</button>
          </div>
        </form>
      )}

      {/* Habits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {habits.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No patterns logged yet. Click "NEW PATTERN" to start building your STREAK!
          </div>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.history || {});

            return (
              <div key={habit.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
                      <Flame size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{habit.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Target: {habit.targetDays}D/week
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 800, color: '#f97316' }}>
                      <Flame size={18} />
                      <span>{streak}D STREAK</span>
                    </div>

                    <button 
                      className="btn-icon" 
                      onClick={() => { sounds.playDelete(); onDeleteHabit(habit.id); }}
                      title="PURGE"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 7 Day Heatmap Checks */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)' }}>
                  {last7Days.map((day) => {
                    const isChecked = !!habit.history?.[day.dateStr];

                    return (
                      <div 
                        key={day.dateStr} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: day.isToday ? 700 : 500, color: day.isToday ? 'var(--accent-light)' : 'var(--text-subtle)' }}>
                          {day.dayName}
                        </span>

                        <div 
                          className={`checkbox-custom ${isChecked ? 'checked' : ''}`}
                          style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                          onClick={() => handleDayCheck(habit.id, day.dateStr, isChecked)}
                        >
                          {isChecked && <Check size={18} />}
                        </div>
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
