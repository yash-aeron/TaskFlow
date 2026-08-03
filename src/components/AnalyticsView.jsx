import React from 'react';
import { BarChart3, PieChart, CheckCircle2, AlertCircle, Clock, Target, Award } from 'lucide-react';

export default function AnalyticsView({ tasks = [], categories = [] }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total time
  const totalEstTime = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalActualTime = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

  // Priority Breakdown
  const priorities = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Category Breakdown
  const catBreakdown = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat.id);
    const completed = catTasks.filter(t => t.status === 'completed').length;
    return {
      name: cat.name,
      color: cat.color,
      total: catTasks.length,
      completed,
      percent: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>&gt;_ MAGI ANALYSIS OUTPUT</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>
          Detailed metrics and breakdown of task performance and focus time.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SYNC RATE</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)', fontFamily: 'var(--font)' }}>{completionRate}%</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOTAL OPS</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font)' }}>{totalTasks}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'var(--font)' }}>{completedTasks} completed / {activeTasks} active</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EST. TIME PLANNED</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font)' }}>{Math.floor(totalEstTime / 60)}h {totalEstTime % 60}m</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'var(--font)' }}>Total scheduled duration</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>FOCUSED TIME SPENT</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font)' }}>{Math.floor(totalActualTime / 60)}h {totalActualTime % 60}m</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'var(--font)' }}>Logged via Pomodoro Studio</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>// CATEGORY SYNC RATES</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {catBreakdown.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: 'var(--radius)', background: cat.color }} />
                  {cat.name}
                </span>
                <span>{cat.completed} / {cat.total} ({cat.percent}%)</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>// PRIORITY DISTRIBUTION</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--priority-urgent-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--priority-urgent)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Urgent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--priority-urgent)', fontFamily: 'var(--font)' }}>{priorities.urgent}</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--priority-high-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--priority-high)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>High</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--priority-high)', fontFamily: 'var(--font)' }}>{priorities.high}</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--priority-medium-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--priority-medium)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Medium</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--priority-medium)', fontFamily: 'var(--font)' }}>{priorities.medium}</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--priority-low-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--priority-low)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>Low</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--priority-low)', fontFamily: 'var(--font)' }}>{priorities.low}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
