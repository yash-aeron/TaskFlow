import React, { useState, useEffect } from 'react';
import { Flame, Check, X } from 'lucide-react';

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
          <Flame size={13} style={{ color: '#f76b15' }} />
          <span>Daily Habits</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={13} /></button>
      </div>

      <div className="widget-body">
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#666' }}>
            No habits created
          </div>
        ) : (
          habits.map(habit => {
            const isChecked = !!habit.history?.[todayStr];
            return (
              <div key={habit.id} className="widget-item-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div 
                    className={`widget-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleToggle(habit.id)}
                  >
                    {isChecked && <Check size={11} />}
                  </div>
                  <span style={{ fontSize: 12 }}>{habit.title}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
