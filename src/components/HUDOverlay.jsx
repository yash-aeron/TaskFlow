import React from 'react';

// Subtle, non-interactive EVA "entry plug" HUD. It stays OUT of the way of the
// actual interface: a very faint full-canvas reticle behind everything, small
// targeting brackets at the extreme screen corners, and one compact sync readout
// pinned to the bottom edge. Nothing overlaps the content or header.
export default function HUDOverlay({ syncRate = 0, isPersona = false }) {
  if (isPersona) return null;

  const sync = Math.min(100, Math.max(0, Math.round(syncRate || 0)));

  return (
    <div className="eva-hud" aria-hidden="true">
      {/* Faint targeting reticle (NERV TargetingReticle shape) as background texture */}
      <svg className="hud-reticle" viewBox="0 0 200 200" role="presentation">
        <g fill="none" stroke="currentColor">
          {/* outer circle with tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i * 10 * Math.PI) / 180;
            const isMain = i % 9 === 0;
            const r1 = 88 - (isMain ? 7 : 3);
            const r2 = 88;
            return (
              <line
                key={i}
                x1={100 + r1 * Math.cos(a)}
                y1={100 + r1 * Math.sin(a)}
                x2={100 + r2 * Math.cos(a)}
                y2={100 + r2 * Math.sin(a)}
                opacity={isMain ? 0.8 : 0.4}
              />
            );
          })}
          <circle cx="100" cy="100" r="88" opacity="0.6" />
          <circle cx="100" cy="100" r="40" opacity="0.5" strokeDasharray="6 4" />
          {/* diamond frame */}
          <polygon points="100,28 172,100 100,172 28,100" opacity="0.5" />
          <line x1="100" y1="28" x2="100" y2="172" opacity="0.3" />
          <line x1="28" y1="100" x2="172" y2="100" opacity="0.3" />
          {/* crosshair center */}
          <line x1="92" y1="100" x2="108" y2="100" opacity="0.8" />
          <line x1="100" y1="92" x2="100" y2="108" opacity="0.8" />
        </g>
      </svg>

      {/* Framing brackets at the extreme corners */}
      <i className="hud-bracket hud-br-tl" />
      <i className="hud-bracket hud-br-tr" />
      <i className="hud-bracket hud-br-bl" />
      <i className="hud-bracket hud-br-br" />

      {/* Compact sync readout pinned to the bottom edge */}
      <div className="hud-chip">
        <span>A-10 // SYNC</span>
        <span className="hud-chip-num">{sync}%</span>
      </div>
    </div>
  );
}
