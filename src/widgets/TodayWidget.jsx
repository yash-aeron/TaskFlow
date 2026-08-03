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
          <Calendar size={13} style={{ color: '#5e6ad2' }} />
          <span>Today's Tasks ({todayTasks.filter(t => t.status !== 'completed').length})</span>
        </div>
        <button className="widget-close" onClick={handleClose}><X size={13} /></button>
      </div>

      <div className="widget-body">
        {todayTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#666' }}>
            No tasks scheduled for today
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
                    {isCompleted && <Check size={11} />}
                  </div>
                  <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
                {task.priority && (
                  <span style={{ 
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', 
                    padding: '1px 4px', borderRadius: 3,
                    background: task.priority === 'urgent' ? 'rgba(229,72,77,0.2)' : 'rgba(94,106,210,0.2)',
                    color: task.priority === 'urgent' ? '#e5484d' : '#8890e0'
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
