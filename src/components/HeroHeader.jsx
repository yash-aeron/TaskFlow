import React from 'react';
import { Plus } from 'lucide-react';

export default function HeroHeader({ tasks = [], onOpenNewTask }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const active = tasks.length - completed;
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  return (
    <div className={isPersona ? "persona-card" : "controls-header nerv-frame"} style={{ position: 'relative', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      {!isPersona && <div className="hazard-stripe-red" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px' }} />}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {isPersona ? (
            <span style={{ padding: '4px 10px', fontSize: '13px', fontWeight: '900', fontFamily: "'Impact', sans-serif", background: '#e60012', color: '#ffffff', border: '1px solid #00e5ff', transform: 'skewX(-10deg)', boxShadow: '-3px 3px 0px #00e5ff' }}>
              TAKE YOUR TIME
            </span>
          ) : (
            <span className="hazard-stripe-red" style={{ padding: '2px 8px', fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-kanji)', letterSpacing: '0.1em' }}>
              第一種戦闘配置
            </span>
          )}

          <h2 style={{ 
            fontSize: isPersona ? '20px' : '18px', 
            fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', 
            letterSpacing: '0.15em', margin: 0, 
            color: isPersona ? '#00e5ff' : '#ffffff', 
            textShadow: isPersona ? '-2px 2px 0px #e60012' : '0 0 10px rgba(255, 0, 0, 0.6)' 
          }}>
            {isPersona ? "ALL-OUT ATTACK // MISSION LOG" : "第一種戦闘配置 // BATTLE STATIONS CONDITION ONE"}
          </h2>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font)', letterSpacing: '0.08em', color: isPersona ? '#ffffff' : 'var(--nerv-amber)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>{isPersona ? "[ ♠ ALERT ]" : "[ 警報 ALERT ]"}</span>
          <span style={isPersona ? { color: '#00e5ff', fontWeight: 'bold' } : {}}>[ ACTIVE TARGETS: {active} ]</span>
          <span style={isPersona ? { color: '#e60012', fontWeight: 'bold' } : {}}>[ DEFEATED: {completed} ]</span>
        </div>
      </div>

      <button 
        className={isPersona ? "btn btn-primary" : "btn btn-primary hazard-stripe-red"} 
        onClick={onOpenNewTask}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
          fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)',
          fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em', cursor: 'pointer'
        }}
      >
        <Plus size={16} />
        <span>{isPersona ? "INITIALIZE MISSION" : "[ 使徒襲来 ] INITIALIZE NEW OPERATION"}</span>
      </button>
    </div>
  );
}
