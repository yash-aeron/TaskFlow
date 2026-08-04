import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function HabitsWidget() {
  const [habits, setHabits] = useState([]);
  const [themeMode, setThemeMode] = useState('nerv');

  useEffect(() => {
    if (window.widgetAPI) {
      window.widgetAPI.getHabits().then(h => setHabits(h || []));
      const unsubscribe = window.widgetAPI.onDataUpdate(({ habits: newHabits, themeMode: newMode }) => {
        if (newHabits) setHabits(newHabits);
        if (newMode) {
          setThemeMode(newMode);
          document.documentElement.setAttribute('data-theme-mode', newMode);
        }
      });
      return unsubscribe;
    }
  }, []);

  const isPersona = themeMode === 'persona';
  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (habitId) => {
    if (window.widgetAPI) {
      window.widgetAPI.toggleHabit(habitId, todayStr);
    }
  };

  const handleClose = () => {
    if (window.widgetAPI) window.widgetAPI.closeWidget();
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <span>{isPersona ? "♠ CONFIDANT SOCIAL LINKS" : "[ SH06D NERV ] PATTERNS"}</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body">
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: isPersona ? '#00e5ff' : '#ff9ec0', fontSize: 10 }}>
            {isPersona ? "NO SOCIAL LINKS FOUND" : "NO PATTERNS REGISTERED"}
          </div>
        ) : (
          habits.map(habit => {
            const isChecked = !!habit.history?.[todayStr];
            return (
              <div key={habit.id} className="widget-item-row" style={{ borderLeftColor: isChecked ? (isPersona ? '#00e5ff' : '#00ff66') : (isPersona ? '#e60012' : '#ff9900') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div 
                    className={`widget-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleToggle(habit.id)}
                  >
                    {isChecked && <Check size={10} style={{ color: '#000' }} />}
                  </div>
                  <span style={{ fontSize: 11, color: '#ffffff' }}>{habit.title}</span>
                </div>
                <span style={{ fontSize: 9, color: isChecked ? (isPersona ? '#00e5ff' : '#00ff66') : (isPersona ? '#e60012' : '#ff3ea5'), fontWeight: 900 }}>
                  {isChecked ? (isPersona ? 'RANK UP' : 'SYNCED') : (isPersona ? 'INACTIVE' : 'PENDING')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
