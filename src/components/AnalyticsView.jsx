import React from 'react';
import { BarChart3, PieChart, CheckCircle2, AlertCircle, Clock, Target, Award, Cpu, ShieldAlert, Zap } from 'lucide-react';

export default function AnalyticsView({ tasks = [], categories = [] }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total time
  const totalEstTime = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalActualTime = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
  const efficiencyIndex = totalEstTime > 0 
    ? Math.round((totalActualTime / totalEstTime) * 100) 
    : (totalActualTime > 0 ? 100 : 0);

  // Priority / Threat Breakdown
  const priorities = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Active Threat Level code
  const activeThreatCode = priorities.urgent > 0 
    ? 'RED // URGENT' 
    : priorities.high > 0 
    ? 'ORANGE // HIGH' 
    : priorities.medium > 0 
    ? 'YELLOW // MID' 
    : 'GREEN // STABLE';

  // Category Breakdown
  const catBreakdown = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat.id);
    const completed = catTasks.filter(t => t.status === 'completed').length;
    return {
      name: cat.name,
      color: cat.color || '#ff6600',
      total: catTasks.length,
      completed,
      percent: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
    };
  });

  const avgCatSync = catBreakdown.length > 0 
    ? Math.round(catBreakdown.reduce((acc, c) => acc + c.percent, 0) / catBreakdown.length) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#000000', padding: '4px' }}>
      {/* Top Emergency Banner */}
      <div className="hazard-stripe-red" style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>警報 // MAGI SYSTEM TRI-PARADIGM DECISION LOGIC</span>
        <span>MAGI-01 / MAGI-02 / MAGI-03 ACTIVE</span>
      </div>

      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--nerv-red)', fontSize: '1.4rem', letterSpacing: '0.1em', margin: 0 }}>
          &gt;_ MAGI THREE-SYSTEM ANALYSIS // <span className="kanji-text">第一種戦闘配置</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--nerv-amber)', fontFamily: 'var(--font)', margin: '4px 0 0 0', letterSpacing: '0.05em' }}>
          TOKYO-3 NERV HQ SUPERCOMPUTER MAGI SYSTEM // MELCHIOR 1 - BALTHASAR 2 - CASPER 3
        </p>
      </div>

      {/* 3 Stretched Red Hexagonal Cards matching Reference Image 1 & 5 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {/* Node 1: MAGI Melchior 1 */}
        <div 
          style={{
            background: '#ff0000',
            color: '#ffffff',
            border: '2px solid #ffffff',
            padding: '20px 28px',
            position: 'relative',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.7)',
            clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0% 50%)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em', background: '#000000', color: '#ffffff', padding: '2px 6px' }}>
              MAGI-01
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffe600', letterSpacing: '0.1em' }} className="kanji-text">
              科学者 // SCIENTIST
            </span>
          </div>

          <div style={{ margin: '10px 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              MAGI Melchior 1
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffe600', marginTop: '2px', fontFamily: 'var(--font)' }}>
              TOTAL OPERATIONS: <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginLeft: '6px' }}>{totalTasks}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ffffff', opacity: 0.9, marginTop: '2px' }}>
              {completedTasks} RESOLVED / {activeTasks} ACTIVE OPERATIONS
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>CATEGORY SYNC RATE:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffe600' }}>{avgCatSync}%</span>
          </div>
        </div>

        {/* Node 2: MAGI Balthasar 2 */}
        <div 
          style={{
            background: '#ff0000',
            color: '#ffffff',
            border: '2px solid #ffffff',
            padding: '20px 28px',
            position: 'relative',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.7)',
            clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0% 50%)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em', background: '#000000', color: '#ffffff', padding: '2px 6px' }}>
              MAGI-02
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffe600', letterSpacing: '0.1em' }} className="kanji-text">
              母親 // MOTHER
            </span>
          </div>

          <div style={{ margin: '10px 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              MAGI Balthasar 2
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffe600', marginTop: '2px', fontFamily: 'var(--font)' }}>
              COMPLETION RATE: <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginLeft: '6px' }}>{completionRate}%</span>
            </div>
            {/* Multi-segment Chevrons Progress */}
            <div className="chevron-bar-container" style={{ margin: '6px 0' }}>
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`chevron-segment ${i < Math.round(completionRate / 10) ? 'active-green' : ''}`}
                  style={{ flex: 1, height: '12px' }}
                />
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>ACTIVE THREAT LEVEL:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffe600', background: '#000000', padding: '2px 6px' }}>
              {activeThreatCode}
            </span>
          </div>
        </div>

        {/* Node 3: MAGI Casper 3 */}
        <div 
          style={{
            background: '#ff0000',
            color: '#ffffff',
            border: '2px solid #ffffff',
            padding: '20px 28px',
            position: 'relative',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.7)',
            clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0% 50%)',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em', background: '#000000', color: '#ffffff', padding: '2px 6px' }}>
              MAGI-03
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffe600', letterSpacing: '0.1em' }} className="kanji-text">
              女 // WOMAN
            </span>
          </div>

          <div style={{ margin: '10px 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              MAGI Casper 3
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffe600', marginTop: '2px', fontFamily: 'var(--font)' }}>
              TOTAL FOCUSED HOURS: <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginLeft: '6px' }}>{Math.floor(totalActualTime / 60)}h {totalActualTime % 60}m</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ffffff', opacity: 0.9, marginTop: '2px' }}>
              PLANNED DURATION: {Math.floor(totalEstTime / 60)}h {totalEstTime % 60}m
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>EFFICIENCY INDEX:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffe600' }}>{efficiencyIndex}%</span>
          </div>
        </div>
      </div>

      {/* Section 1: CATEGORY DISTRIBUTION MATRIX */}
      <div className="nerv-frame card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#050505', borderColor: 'var(--border-amber)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #331400', paddingBottom: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--nerv-amber)', fontSize: '1.1rem', letterSpacing: '0.1em', margin: 0 }}>
            [ 警報 ] CATEGORY DISTRIBUTION MATRIX
          </h3>
          <span className="kanji-text" style={{ fontSize: '0.8rem', color: 'var(--nerv-yellow)', fontWeight: 900 }}>
            同期率分析 // SYNC MATRIX
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {catBreakdown.length === 0 ? (
            <div style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '20px' }}>
              NO CATEGORY DATA AVAILABLE
            </div>
          ) : (
            catBreakdown.map((cat) => (
              <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
                    <span style={{ width: '12px', height: '12px', background: cat.color, border: '1px solid #ffffff' }} />
                    {cat.name.toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--nerv-amber)' }}>
                    {cat.completed} / {cat.total} COMPLETED ({cat.percent}% SYNC)
                  </span>
                </div>

                {/* Diagonal Multi-Segment Chevrons for progress */}
                <div className="chevron-bar-container" style={{ background: '#000000', padding: '4px', border: '1px solid #1a0a00' }}>
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`chevron-segment ${i < Math.round(cat.percent / 5) ? 'active-amber' : ''}`} 
                      style={{ flex: 1, height: '14px' }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 2: THREAT LEVEL ANALYTICS */}
      <div className="nerv-frame card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#050505', borderColor: 'var(--nerv-red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #330000', paddingBottom: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--nerv-red)', fontSize: '1.1rem', letterSpacing: '0.1em', margin: 0 }}>
            [ 警報 ] THREAT LEVEL ANALYTICS
          </h3>
          <span className="kanji-text" style={{ fontSize: '0.8rem', color: 'var(--nerv-red)', fontWeight: 900 }}>
            使徒襲来 // PRIORITY SPECTRUM
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {/* Urgent */}
          <div style={{ padding: '14px', background: '#1a0000', border: '2px solid var(--nerv-red)', boxShadow: '0 0 10px rgba(255,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--nerv-red)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                CODE RED // URGENT
              </span>
              <span className="kanji-text" style={{ fontSize: '0.7rem', color: 'var(--nerv-red)', fontWeight: 900 }}>極秘</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font)' }}>{priorities.urgent}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Critical Battle Priority</span>
          </div>

          {/* High */}
          <div style={{ padding: '14px', background: '#190a00', border: '1px solid var(--nerv-amber)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--nerv-amber)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                CODE ORANGE // HIGH
              </span>
              <span className="kanji-text" style={{ fontSize: '0.7rem', color: 'var(--nerv-amber)', fontWeight: 900 }}>第一種</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font)' }}>{priorities.high}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>High Defense Priority</span>
          </div>

          {/* Medium */}
          <div style={{ padding: '14px', background: '#191700', border: '1px solid var(--nerv-yellow)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--nerv-yellow)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                CODE YELLOW // MID
              </span>
              <span className="kanji-text" style={{ fontSize: '0.7rem', color: 'var(--nerv-yellow)', fontWeight: 900 }}>第二種</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font)' }}>{priorities.medium}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Standard Ops Condition</span>
          </div>

          {/* Low */}
          <div style={{ padding: '14px', background: '#001a0a', border: '1px solid var(--terminal-green)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--terminal-green)', fontFamily: 'var(--font)', textTransform: 'uppercase' }}>
                CODE GREEN // LOW
              </span>
              <span className="kanji-text" style={{ fontSize: '0.7rem', color: 'var(--terminal-green)', fontWeight: 900 }}>通常</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font)' }}>{priorities.low}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Routine Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

