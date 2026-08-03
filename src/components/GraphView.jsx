import React, { useEffect, useRef } from 'react';

export default function GraphView({ tasks = [], categories = [] }) {
  const canvasRef = useRef(null);
  const isPersona = document.documentElement.getAttribute('data-theme-mode') === 'persona';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = canvas.parentElement.clientWidth || 800;
    const height = canvas.height = 420;

    // Draw background
    ctx.fillStyle = isPersona ? '#04040c' : '#000000';
    ctx.fillRect(0, 0, width, height);

    // Nodes
    const nodes = tasks.map((t, idx) => ({
      id: t.id,
      title: t.title,
      completed: t.status === 'completed',
      x: 100 + (idx * 140) % (width - 150),
      y: 80 + (Math.sin(idx) * 100 + 120),
      color: t.status === 'completed' ? (isPersona ? '#00e5ff' : '#00ff66') : (isPersona ? '#e60012' : '#ff0000')
    }));

    // Draw lines
    ctx.strokeStyle = isPersona ? 'rgba(0, 229, 255, 0.3)' : 'rgba(255, 102, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[i+1].x, nodes[i+1].y);
      ctx.stroke();
    }

    // Draw nodes
    nodes.forEach(node => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(node.title.substring(0, 14), node.x - 20, node.y + 20);
    });

  }, [tasks, isPersona]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '18px', fontFamily: isPersona ? "'Impact', sans-serif" : 'var(--font-heading)', color: isPersona ? '#00e5ff' : '#ff0000', margin: 0 }}>
          {isPersona ? "PERSONA NETWORK CIRCUIT // SOCIAL & MISSION LINKS" : ">_ NEURAL CIRCUITRY NETWORK // MAGI SYSTEM 警報"}
        </h2>
      </div>

      <div className={isPersona ? "persona-card" : "card nerv-frame"} style={{ padding: '10px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '420px', display: 'block' }} />
      </div>
    </div>
  );
}
