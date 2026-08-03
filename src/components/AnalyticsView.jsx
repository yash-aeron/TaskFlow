import React from 'react';
import { BarChart3, CheckCircle, Clock, Zap, Target } from 'lucide-react';

export default function AnalyticsView({ tasks = [], categories = [] }) {
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const totalFocusMinutes = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000', letterSpacing: '0.12em', margin: 0 }}>
          {isPersona ? "PERSONA SYSTEM STATUS // STATS & QUEST ANALYTICS" : ">_ MAGI THREE-SYSTEM ANALYSIS // 第一種戦闘配置"}
        </h2>
        <p style={{ fontSize: '11px', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', marginTop: '4px', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
          {isPersona ? "VELVET ROOM OVERVIEW // MISSION OUTPUT & SOCIAL STATS" : "SUPERCOMPUTER NODES MELCHIOR-1 • BALTHASAR-2 • CASPER-3"}
        </p>
      </div>

      {/* 3 Main Stat Nodes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Node 1 */}
        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: isPersona ? '#00e5ff' : '#ff0000', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)' }}>
              {isPersona ? "NODE 1: MISSIONS" : "MAGI MELCHIOR 1"}
            </span>
            <CheckCircle size={18} style={{ color: isPersona ? '#00e5ff' : '#ff0000' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: '#ffffff' }}>
            {completedCount}/{totalCount}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            TOTAL OPERATIONS COMPLETED
          </span>
        </div>

        {/* Node 2 */}
        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: isPersona ? '#e60012' : '#ff6600', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)' }}>
              {isPersona ? "NODE 2: SYNC RATE" : "MAGI BALTHASAR 2"}
            </span>
            <Target size={18} style={{ color: isPersona ? '#e60012' : '#ff6600' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#00ff66' }}>
            {completionRate}%
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            OVERALL MISSION EFFICIENCY
          </span>
        </div>

        {/* Node 3 */}
        <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#00ff66', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font)' }}>
              {isPersona ? "NODE 3: FOCUS TIME" : "MAGI CASPER 3"}
            </span>
            <Clock size={18} style={{ color: '#00ff66' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: '#00ff66' }}>
            {totalFocusMinutes}M
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            TOTAL FOCUS MINUTES LOGGED
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '14px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : 'var(--nerv-amber)' }}>
          {isPersona ? "COOP / CATEGORY DISTRIBUTION MATRIX" : "[ 警報 ] CATEGORY DISTRIBUTION MATRIX"}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat.id);
            const catDone = catTasks.filter(t => t.status === 'completed').length;
            const pct = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font)' }}>
                  <span style={{ color: cat.color }}>{cat.name} ({catDone}/{catTasks.length})</span>
                  <span style={{ color: isPersona ? '#00e5ff' : '#00ff66' }}>{pct}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
