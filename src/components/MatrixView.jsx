import React from 'react';
import { Flame, Clock, Users, Trash2, Plus, Edit3, CheckSquare } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function MatrixView({ tasks = [], onEditTask, onUpdateTaskStatus, onDeleteTask, onOpenNewTask }) {
  // Quadrants logic
  const doFirst = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');
  const schedule = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed');
  const delegate = tasks.filter(t => t.priority === 'low' && t.status !== 'completed');
  const completed = tasks.filter(t => t.status === 'completed');

  const quadrants = [
    { 
      id: 'do_first', 
      title: 'MAGI MELCHIOR 1 // CRITICAL (URGENT/IMPORTANT)', 
      code: 'MAGI-01',
      icon: Flame, 
      color: '#ff0000', 
      headerBg: 'hazard-stripe-red',
      borderColor: '#ff0000',
      bg: '#050000', 
      isHex: true,
      tasks: doFirst 
    },
    { 
      id: 'schedule', 
      title: 'MAGI BALTHASAR 2 // STRATEGIC (IMPORTANT)', 
      code: 'MAGI-02',
      icon: Clock, 
      color: '#ff6600', 
      headerBg: 'hazard-stripe-yellow',
      borderColor: '#ff6600',
      bg: '#050300', 
      isHex: false,
      tasks: schedule 
    },
    { 
      id: 'delegate', 
      title: 'MAGI CASPER 3 // TACTICAL (URGENT)', 
      code: 'MAGI-03',
      icon: Users, 
      color: '#ffe600', 
      headerBg: 'hazard-stripe-yellow',
      borderColor: '#ffe600',
      bg: '#050500', 
      isHex: false,
      tasks: delegate 
    },
    { 
      id: 'completed', 
      title: 'OVERRIDE LOG // DEFERRED', 
      code: 'LOG-SYS',
      icon: CheckSquare, 
      color: '#00ff66', 
      headerBg: 'hazard-stripe-cyan',
      borderColor: '#333333',
      bg: '#030303', 
      isHex: false,
      tasks: completed 
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Controls Header */}
      <div className="controls-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', color: 'var(--nerv-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>&gt;_ MAGI EISENHOWER DECISION MATRIX</span>
            <span className="kanji-text" style={{ color: 'var(--nerv-yellow)', fontSize: '0.9em' }}>// 警報 使徒襲来</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '0.04em' }}>
            CLASSIFY OPERATION THREAT LEVELS ACROSS TRIPLE MAGI DELIBERATION NODES
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => { sounds.playClick(); onOpenNewTask(); }}>
          <Plus size={16} />
          <span>[ 使徒襲来 ] NEW DIRECTIVE</span>
        </button>
      </div>

      {/* 2x2 Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', width: '100%' }}>
        {quadrants.map(q => {
          const Icon = q.icon;

          return (
            <div 
              key={q.id} 
              className={`card nerv-frame ${q.isHex ? 'magi-hex-node-dark' : ''}`}
              style={{ 
                background: q.bg, 
                borderColor: q.borderColor,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '300px',
                padding: '0'
              }}
            >
              {/* Quadrant Header with Hazard Banner */}
              <div 
                className={q.headerBg}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 14px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  borderBottom: `2px solid ${q.borderColor}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} />
                  <span className="kanji-text">{q.title}</span>
                </div>
                <span className="badge" style={{ background: '#000000', color: '#ffffff', borderColor: '#ffffff', fontSize: '0.75rem' }}>
                  {q.tasks.length}
                </span>
              </div>

              {/* Node status indicator line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px', fontSize: '0.7rem', color: q.color, opacity: 0.9 }}>
                <span>MAGI REF: {q.code}</span>
                <span>CHEVRON: /// /// ///</span>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, padding: '0 14px 14px', overflowY: 'auto' }}>
                {q.tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-subtle)', fontSize: '0.8rem', border: '1px dashed var(--border)', background: '#000000' }}>
                    <div>[ NO THREATS REGISTERED IN SECTOR ]</div>
                    <div className="kanji-text" style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.6 }}>MAGI-NODE COMPLETE</div>
                  </div>
                ) : (
                  q.tasks.map(t => (
                    <div 
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#080808',
                        borderRadius: '0',
                        border: `1px solid ${q.borderColor}`,
                        borderLeft: `4px solid ${q.color}`
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</span>
                          <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
                        </div>
                        {t.dueDate && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TIMECODE: {t.dueDate} {t.dueTime || ''}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => onEditTask(t)} title="Edit Directive">
                          <Edit3 size={13} />
                        </button>
                        <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => { sounds.playDelete(); onDeleteTask(t.id); }} title="Purge Directive">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
