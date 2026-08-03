import React from 'react';
import { 
  CheckSquare, Kanban, Calendar as CalendarIcon, Flame, Timer, BarChart3, 
  Network, Grid, Clock, TrendingUp
} from 'lucide-react';

export default function Sidebar({ 
  currentView, setCurrentView, categories = [], activeCategory, setActiveCategory, 
  tasks = [], allTags = [], activeTag, setActiveTag
}) {
  const views = [
    { id: 'list', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'kanban', label: 'Board', icon: Kanban },
    { id: 'graph', label: 'Graph', icon: Network },
    { id: 'matrix', label: 'Matrix', icon: Grid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">// SYSTEMS</div>
        {views.map(v => {
          const Icon = v.icon;
          return (
            <button key={v.id} className={`nav-item ${currentView === v.id ? 'active' : ''}`}
              onClick={() => setCurrentView(v.id)}>
              <div className="nav-item-left"><Icon size={14} /><span>{v.label}</span></div>
              {v.count != null && <span className="badge">{v.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>// SECTORS</span>
          {activeCategory && <span style={{ cursor: 'pointer', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '9px' }} onClick={() => setActiveCategory(null)}>Clear</span>}
        </div>
        {categories.map(cat => {
          const count = tasks.filter(t => t.category === cat.id && t.status !== 'completed').length;
          return (
            <button key={cat.id} className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}>
              <div className="nav-item-left">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <span>{cat.name}</span>
              </div>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {allTags.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">// MARKERS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '0 4px' }}>
            {allTags.map(tag => (
              <span key={tag} className="tag-badge"
                style={{ cursor: 'pointer', background: activeTag === tag ? 'var(--accent)' : undefined, color: activeTag === tag ? '#fff' : undefined }}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: '8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span>SYNC RATE</span><span>{completionRate}%</span>
        </div>
        <div className="progress-bar-container" style={{ border: '1px solid var(--border)', height: '4px' }}>
          <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
          {completedCount}/{tasks.length} OPS
        </div>
      </div>
    </aside>
  );
}
