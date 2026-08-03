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

  const completedCount = habits.filter(h => !!h.history?.[todayStr]).length;

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <Flame size={12} />
          <span>// PATTERNS [{completedCount}/{habits.length}]</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body">
        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#4a4a6e', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
            NO PATTERNS REGISTERED
          </div>
        ) : (
          habits.map(habit => {
            const isChecked = !!habit.history?.[todayStr];
            return (
              <div key={habit.id} className="widget-item-row" style={{
                borderLeftColor: isChecked ? '#00cc34' : '#8B5CF6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div 
                    className={`widget-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleToggle(habit.id)}
                    style={isChecked ? { background: '#00cc34', borderColor: '#00cc34' } : {}}
                  >
                    {isChecked && <Check size={9} />}
                  </div>
                  <span style={{ fontSize: 11, opacity: isChecked ? 0.5 : 1 }}>{habit.title}</span>
                </div>
                {isChecked && (
                  <span style={{ fontSize: 8, fontWeight: 800, color: '#00cc34', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    SYNCED
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
