import React, { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';

export default function TodayWidget() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (window.widgetAPI) {
      window.widgetAPI.getTasks().then(t => setTasks(t || []));
      const unsubscribe = window.widgetAPI.onDataUpdate(({ tasks: newTasks }) => {
        if (newTasks) setTasks(newTasks);
      });
      return unsubscribe;
    }
  }, []);

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
          <Calendar size={12} />
          <span>// TODAY OPS ({todayTasks.filter(t => t.status !== 'completed').length})</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={12} /></button>
      </div>

      <div className="widget-body">
        {todayTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#4a4a6e', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
            NO OPERATIONS SCHEDULED
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
                    {isCompleted && <Check size={9} />}
                  </div>
                  <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
                {task.priority && (
                  <span style={{ 
                    fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '1px 4px', borderRadius: 1,
                    border: '1px solid',
                    background: task.priority === 'urgent' ? 'rgba(220,38,38,0.15)' : 'rgba(139,92,246,0.15)',
                    color: task.priority === 'urgent' ? '#DC2626' : '#8B5CF6',
                    borderColor: task.priority === 'urgent' ? '#DC2626' : '#8B5CF6'
                  }}>
                    {task.priority}
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
