import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function HabitsWidget() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    if (window.widgetAPI) {
      window.widgetAPI.getHabits().then(h => setHabits(h || []));
      const unsubscribe = window.widgetAPI.onDataUpdate(({ habits: newHabits }) => {
        if (newHabits) setHabits(newHabits);
      });
      return unsubscribe;
    }
  }, []);

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
          <span>[ SH06D NERV ] PATTERNS</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body">
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#ff9966', fontSize: 10 }}>
            NO PATTERNS REGISTERED
          </div>
        ) : (
          habits.map(habit => {
            const isChecked = !!habit.history?.[todayStr];
            return (
              <div key={habit.id} className="widget-item-row" style={{ borderLeftColor: isChecked ? '#00ff66' : '#ff0000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div 
                    className={`widget-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleToggle(habit.id)}
                  >
                    {isChecked && <Check size={10} style={{ color: '#000' }} />}
                  </div>
                  <span style={{ fontSize: 11, color: '#ffffff' }}>{habit.title}</span>
                </div>
                <span style={{ fontSize: 9, color: isChecked ? '#00ff66' : '#ff6600', fontWeight: 900 }}>
                  {isChecked ? 'SYNCED' : 'PENDING'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
