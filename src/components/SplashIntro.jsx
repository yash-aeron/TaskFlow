import React, { useEffect, useState } from 'react';

export default function SplashIntro({ onComplete }) {
  const [phase, setPhase] = useState(1); // 1: NERV MAGI Boot, 2: Persona Takeover, 3: Complete

  useEffect(() => {
    // Phase 1: NERV MAGI Boot (0 -> 1000ms)
    const t1 = setTimeout(() => {
      setPhase(2);
    }, 1200);

    // Phase 2: Persona Takeover (1200 -> 2400ms)
    const t2 = setTimeout(() => {
      setPhase(3);
    }, 2400);

    // Phase 3: Complete & Unmount (2700ms)
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === 3) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.3s ease-out',
        opacity: phase === 3 ? 0 : 1,
        pointerEvents: phase === 3 ? 'none' : 'auto'
      }}
    >
      {/* Top/Bottom Hazard Stripes */}
      <div 
        className="hazard-stripe-red" 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
          boxShadow: '0 0 15px #ff9900'
        }} 
      />
      <div 
        className="hazard-stripe-yellow" 
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
          boxShadow: '0 0 15px #ffb000'
        }} 
      />

      {/* PHASE 1: NERV MAGI INITIALIZATION */}
      {phase === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.3s ease-in' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="magi-hex-node" style={{ width: '80px', height: '60px', fontSize: '10px' }}>
              <div style={{ fontWeight: '900' }}>MAGI-1</div>
              <div style={{ fontSize: '8px', color: '#ffb000' }}>MELCHIOR</div>
            </div>
            <div className="magi-hex-node" style={{ width: '80px', height: '60px', fontSize: '10px', background: '#ff3ea5' }}>
              <div style={{ fontWeight: '900' }}>MAGI-2</div>
              <div style={{ fontSize: '8px', color: '#ffffff' }}>BALTHASAR</div>
            </div>
            <div className="magi-hex-node" style={{ width: '80px', height: '60px', fontSize: '10px' }}>
              <div style={{ fontWeight: '900' }}>MAGI-3</div>
              <div style={{ fontSize: '8px', color: '#ffb000' }}>CASPER</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-kanji)', color: '#ff9900', letterSpacing: '0.2em' }}>
              第一種戦闘配置 // NERV SYSTEM BOOT
            </span>
            <div style={{ fontSize: '12px', color: '#ff3ea5', fontFamily: 'var(--font)', letterSpacing: '0.12em' }}>
              INITIALIZING TOKYO-3 MAGI SUPERCOMPUTER NODES...
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: PERSONA PHANTOM TAKEOVER */}
      {phase === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{
            padding: '6px 20px', background: '#e60012', color: '#ffffff',
            fontWeight: 900, fontSize: '16px', fontFamily: "'Impact', sans-serif",
            transform: 'skewX(-12deg)', border: '2px solid #00e5ff',
            boxShadow: '-6px 6px 0px #00e5ff', letterSpacing: '0.15em'
          }}>
            TAKE YOUR TIME // PHANTOM DIRECTIVE READY
          </div>

          <h1 style={{
            fontSize: '3.5rem', fontFamily: "'Impact', sans-serif",
            color: '#00e5ff', textShadow: '-4px 4px 0px #e60012',
            letterSpacing: '0.2em', margin: 0, transform: 'rotate(-2deg)'
          }}>
            T a S K F L o W
          </h1>

          <div style={{
            fontSize: '11px', color: '#ffffff', fontFamily: 'var(--font)',
            background: '#0e0f24', border: '1px solid #00e5ff', padding: '4px 12px',
            transform: 'skewX(-6deg)'
          }}>
            ♠ PERSONA PHANTOM RELOAD & NERV MAGI ONLINE ♠
          </div>
        </div>
      )}
    </div>
  );
}
