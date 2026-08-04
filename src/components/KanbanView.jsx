import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { sounds } from '../utils/audio';

const COLUMNS = [
  { id: 'backlog', title: 'BACKLOG', color: '#6b7280' },
  { id: 'todo', title: 'TO DO', color: '#3b82f6' },
  { id: 'in_progress', title: 'IN PROGRESS', color: '#f59e0b' },
  { id: 'completed', title: 'COMPLETED', color: '#10b981' }
];

export default function KanbanView({ 
  tasks = [], 
  onUpdateTaskStatus, 
  onEditTask, 
  onDeleteTask,
  categories = [],
  onOpenNewTask,
  themeMode = 'nerv'
}) {
  const isPersona = themeMode === 'persona';

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'General', color: '#6366f1' };
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      sounds.playClick();
      onUpdateTaskStatus(taskId, newStatus);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff9900', letterSpacing: '0.12em', margin: 0 }}>
            {isPersona ? "PERSONA TACTICAL BOARD // TARTARUS DEPLOYMENT" : ">_ MAGI TACTICAL DEPLOYMENT BOARD // 第一種戦闘配置"}
          </h2>
          <p style={{ fontSize: '11px', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', marginTop: '4px', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
            {isPersona ? "DRAG & DROP MISSIONS ACROSS PHANTOM SECTORS" : "DRAG & DROP OPERATIONS ACROSS MAGI SECTOR COLUMNS"}
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewTask}>
          <Plus size={14} />
          <span>{isPersona ? "NEW MISSION" : "[ 使徒襲来 ] INITIALIZE"}</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => {
            if (col.id === 'completed') return t.status === 'completed';
            if (col.id === 'in_progress') return t.status === 'in_progress';
            if (col.id === 'todo') return t.status === 'todo';
            if (col.id === 'backlog') return t.status === 'backlog';
            return false;
          });

          return (
            <div 
              key={col.id} 
              className={isPersona ? "persona-card kanban-column" : "kanban-column nerv-frame"}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <span className="column-title" style={{ fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)', color: isPersona ? '#00e5ff' : 'var(--nerv-amber)' }}>
                  {isPersona ? `♠ ${col.title}` : `[ 警報 ] ${col.title}`}
                </span>
                <span className="badge">{colTasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {colTasks.map(task => {
                  const cat = getCategoryInfo(task.category);
                  return (
                    <div 
                      key={task.id}
                      className={isPersona ? "task-item persona-card" : "task-item"}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      style={{ cursor: 'grab' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font)' }}>
                          {task.title}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => onEditTask(task)}>
                            <Edit3 size={12} />
                          </button>
                          <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => onDeleteTask(task.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="category-tag" style={{ background: cat.color }}>
                          {cat.name}
                        </span>
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
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
