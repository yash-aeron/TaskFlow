import React from 'react';
import { Plus } from 'lucide-react';

export default function HeroHeader({ tasks = [], onOpenNewTask, themeMode = 'nerv' }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const active = tasks.length - completed;
  const isPersona = themeMode === 'persona';

  if (isPersona) {
    return (
      <div className="persona-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', fontSize: '13px', fontWeight: '900', fontFamily: "'Impact', sans-serif", background: '#e60012', color: '#ffffff', border: '1px solid #00e5ff', transform: 'skewX(-10deg)', boxShadow: '-3px 3px 0px #00e5ff' }}>
              TAKE YOUR TIME
            </span>
            <h2 style={{ fontSize: '20px', fontFamily: "'Impact', sans-serif", letterSpacing: '0.15em', margin: 0, color: '#00e5ff', textShadow: '-2px 2px 0px #e60012' }}>
              ALL-OUT ATTACK // MISSION LOG
            </h2>
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font)', letterSpacing: '0.08em', color: '#ffffff', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>[ ♠ ALERT ]</span>
            <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>[ ACTIVE TARGETS: {active} ]</span>
            <span style={{ color: '#e60012', fontWeight: 'bold' }}>[ DEFEATED: {completed} ]</span>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={onOpenNewTask}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontFamily: "'Impact', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em', cursor: 'pointer' }}
        >
          <Plus size={16} />
          <span>INITIALIZE MISSION</span>
        </button>
      </div>
    );
  }

  /* PURE NERV HEADER */
  return (
    <div className="controls-header nerv-frame" style={{ position: 'relative', borderBottom: 'none', padding: '16px', background: '#000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div className="hazard-stripe-red" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="hazard-stripe-red" style={{ padding: '2px 8px', fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-kanji)', letterSpacing: '0.1em' }}>
            第一種戦闘配置
          </span>
          <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '0.15em', margin: 0, color: '#ffffff', textShadow: '0 0 10px rgba(255, 0, 0, 0.6)' }}>
            第一種戦闘配置 // BATTLE STATIONS CONDITION ONE
          </h2>
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'var(--font)', letterSpacing: '0.08em', color: 'var(--nerv-amber)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>[ 警報 ALERT ]</span>
          <span>[ ACTIVE TARGETS: {active} ]</span>
          <span>[ DEFEATED: {completed} ]</span>
        </div>
      </div>

      <button 
        className="btn btn-primary hazard-stripe-red" 
        onClick={onOpenNewTask}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '13px',
          letterSpacing: '0.1em', cursor: 'pointer', border: '1px solid #ff0000',
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
        }}
      >
        <Plus size={16} />
        <span>[ 使徒襲来 ] INITIALIZE NEW OPERATION</span>
      </button>
    </div>
  );
}
