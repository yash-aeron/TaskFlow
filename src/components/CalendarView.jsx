import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { sounds } from '../utils/audio';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ tasks, onEditTask, onOpenNewTaskWithDate, categories }) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Build grid calendar cells
  const calendarCells = [];
  // Empty lead cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ day, dateStr: formattedDate });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header Navigation */}
      <div className="controls-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>
            {MONTHS[month]} {year}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-icon" onClick={prevMonth} title="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="btn-icon" onClick={nextMonth} title="Next Month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}

        {/* Day Cells */}
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="calendar-day-cell" 
                style={{ opacity: 0.3, background: 'transparent', borderColor: 'transparent' }} 
              />
            );
          }

          const dayTasks = tasks.filter(t => t.dueDate === cell.dateStr);
          const isToday = cell.dateStr === todayStr;

          return (
            <div 
              key={cell.dateStr} 
              className={`calendar-day-cell ${isToday ? 'today' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="calendar-day-number">{cell.day}</span>
                
                <button 
                  className="btn-icon" 
                  style={{ width: '20px', height: '20px', padding: 0 }}
                  onClick={() => { sounds.playClick(); onOpenNewTaskWithDate(cell.dateStr); }}
                  title="Add task on this date"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Task Items on Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflowY: 'auto', maxHeight: '110px' }}>
                {dayTasks.map(task => {
                  const catColor = getCategoryColor(task.category);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        backgroundColor: `${catColor}25`,
                        borderLeft: `3px solid ${catColor}`,
                        color: isCompleted ? 'var(--text-subtle)' : 'var(--text-main)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
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
