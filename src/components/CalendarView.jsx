import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { sounds } from '../utils/audio';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ tasks = [], onEditTask, onOpenNewTaskWithDate, categories = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    sounds.playClick();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    sounds.playClick();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getCategoryColor = (catId) => {
    return categories.find(c => c.id === catId)?.color || '#6366f1';
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ day, dateStr: formattedDate });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div className={isPersona ? "persona-card controls-header" : "controls-header nerv-frame"} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', letterSpacing: '0.12em', color: isPersona ? '#00e5ff' : 'var(--text-primary)', margin: 0 }}>
              {isPersona ? "PERSONA CALENDAR // MISSION SCHEDULE" : ">_ MAGI OPERATIONS SCHEDULE // 東京3 NERV"}
            </h2>
            <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font)', fontWeight: 800, color: isPersona ? '#ffffff' : 'var(--nerv-amber)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              /// {MONTHS[month]} {year}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-icon" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>
              TODAY
            </button>
            <button className="btn-icon" onClick={nextMonth} title="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {!isPersona && <div className="hazard-stripe-red" style={{ height: '6px', width: '100%', border: '1px solid #ff0000' }} />}
      </div>

      {/* Days Header */}
      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-header" style={{ fontFamily: 'var(--font)', textTransform: 'uppercase', color: isPersona ? '#00e5ff' : 'var(--nerv-amber)', fontWeight: 800, letterSpacing: '0.1em' }}>
            {d}
          </div>
        ))}

        {/* Day Cells */}
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="calendar-day-cell" 
                style={{ opacity: 0.2, background: 'transparent', borderColor: 'transparent' }} 
              />
            );
          }

          const dayTasks = tasks.filter(t => t.dueDate === cell.dateStr);
          const isToday = cell.dateStr === todayStr;

          return (
            <div 
              key={cell.dateStr} 
              className={`calendar-day-cell ${isToday ? 'today' : ''} ${isPersona ? 'persona-card' : ''}`}
              style={{
                border: isToday ? (isPersona ? '2px solid #00e5ff' : '2px solid #ff0000') : '1px solid var(--border)',
                background: isToday ? (isPersona ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 0, 0, 0.08)') : '#050505',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="calendar-day-number" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: isToday ? '#ffffff' : 'var(--text-secondary)' }}>
                    {cell.day}
                  </span>

                  {isToday && (
                    <span 
                      style={{ 
                        fontSize: '9px', fontWeight: 900, padding: '1px 5px',
                        background: isPersona ? '#e60012' : '#ff0000',
                        color: '#ffffff', border: '1px solid #ffffff', fontFamily: 'var(--font)'
                      }}
                    >
                      {isPersona ? "[ TODAY ]" : "[ TODAY 警報 ]"}
                    </span>
                  )}
                </div>

                <button 
                  className="btn-icon" 
                  style={{ width: '20px', height: '20px', padding: 0 }}
                  onClick={() => { sounds.playClick(); onOpenNewTaskWithDate(cell.dateStr); }}
                  title="Add task on this date"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Task Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflowY: 'auto', maxHeight: '110px' }}>
                {dayTasks.map(task => {
                  const catColor = getCategoryColor(task.category);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      style={{
                        padding: '3px 6px', fontSize: '0.74rem', fontWeight: 700,
                        backgroundColor: isCompleted ? 'rgba(0, 255, 102, 0.1)' : `${catColor}25`,
                        borderLeft: `3px solid ${isCompleted ? '#00ff66' : catColor}`,
                        color: isCompleted ? 'var(--text-subtle)' : 'var(--text-main)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontFamily: 'var(--font)'
                      }}
                      title={`${task.title} (${task.priority})`}
                    >
                      {task.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
