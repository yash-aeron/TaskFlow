import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function TodayWidget() {
  const [tasks, setTasks] = useState([]);
  const [themeMode, setThemeMode] = useState('nerv');

  useEffect(() => {
    if (window.widgetAPI) {
      window.widgetAPI.getTasks().then(t => setTasks(t || []));
      const unsubscribe = window.widgetAPI.onDataUpdate(({ tasks: newTasks, themeMode: newMode }) => {
        if (newTasks) setTasks(newTasks);
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
  const todayTasks = tasks.filter(t => t.dueDate === todayStr || t.status === 'in_progress' || (t.status === 'todo' && !t.dueDate));

  const handleToggle = (taskId) => {
    if (window.widgetAPI) {
      window.widgetAPI.toggleTask(taskId);
    }
  };

  const handleClose = () => {
    if (window.widgetAPI) window.widgetAPI.closeWidget();
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <span>{isPersona ? `♠ TODAY MISSIONS (${todayTasks.filter(t => t.status !== 'completed').length})` : `[ 警報 ] TODAY OPS (${todayTasks.filter(t => t.status !== 'completed').length})`}</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body">
        {todayTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: isPersona ? '#00e5ff' : '#ff9ec0', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>
            {isPersona ? "♠ NO MISSIONS SCHEDULED TODAY" : "[ 警報 ] NO OPERATIONS SCHEDULED TODAY"}
          </div>
        ) : (
          todayTasks.map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <div key={task.id} className={`widget-item-row ${isCompleted ? 'completed' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <div 
                    className={`widget-checkbox ${isCompleted ? 'checked' : ''}`}
                    onClick={() => handleToggle(task.id)}
                  >
                    {isCompleted && <Check size={10} style={{ color: '#000' }} />}
                  </div>
                  <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffffff' }}>
                    {task.title}
                  </span>
                </div>
                {task.priority && (
                  <span style={{ 
                    fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '1px 5px', border: '1px solid',
                    background: task.priority === 'urgent' ? (isPersona ? '#e60012' : '#ff9900') : '#ff3ea5',
                    color: '#ffffff', borderColor: '#ffffff'
                  }}>
                    {task.priority === 'urgent' ? 'URGENT' : task.priority.toUpperCase()}
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
