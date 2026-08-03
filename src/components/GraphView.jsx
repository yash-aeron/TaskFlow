import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GraphView({ tasks, categories, onEditTask }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const selectedNodeRef = useRef(null);
  const graphDataRef = useRef({ nodes: [], links: [] });
  const draggedNodeRef = useRef(null);
  const animRef = useRef(null);

  const setSelectedNodeSync = (node) => {
    selectedNodeRef.current = node;
    setSelectedNode(node);
  };

  const buildGraphData = useCallback((width, height) => {
    const nodes = [];
    const links = [];
    const cx = width / 2;
    const cy = height / 2;

    // Category nodes — MAGI Red (#ff0000) / NERV Amber (#ff6600)
    categories.forEach((cat, i) => {
      const angle = (i / Math.max(categories.length, 1)) * Math.PI * 2;
      const r = Math.min(width, height) * 0.25;
      nodes.push({
        id: `cat-${cat.id}`,
        label: `[CAT] ${cat.name}`,
        type: 'category',
        color: cat.color || '#ff0000', // MAGI Red
        radius: 20,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0
      });
    });

    // Tag nodes — Chevron Cyan (#00ffcc)
    const tagSet = new Set();
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag)));
    const tagArr = Array.from(tagSet);
    tagArr.forEach((tag, i) => {
      const angle = (i / Math.max(tagArr.length, 1)) * Math.PI * 2 + 0.5;
      const r = Math.min(width, height) * 0.35;
      nodes.push({
        id: `tag-${tag}`,
        label: `#${tag}`,
        type: 'tag',
        color: '#00ffcc', // Chevron Cyan
        radius: 11,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0
      });
    });

    // Task nodes — MAGI Red (#ff0000) for Urgent, NERV Amber (#ff6600) for Active, Sync Green (#00ff66) for Completed
    tasks.forEach((t, i) => {
      const isCompleted = t.status === 'completed';
      let color = '#ff6600'; // NERV Amber default
      if (isCompleted) {
        color = '#00ff66'; // Sync Green
      } else if (t.priority === 'urgent' || t.priority === 'high') {
        color = '#ff0000'; // MAGI Red
      }

      const angle = (i / Math.max(tasks.length, 1)) * Math.PI * 2 + 1;
      const r = Math.min(width, height) * 0.15;

      nodes.push({
        id: t.id,
        label: t.title.length > 18 ? t.title.slice(0, 16) + '…' : t.title,
        type: 'task',
        color,
        radius: 13,
        taskData: t,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0
      });

      if (t.category) links.push({ source: t.id, target: `cat-${t.category}` });
      t.tags?.forEach(tag => links.push({ source: t.id, target: `tag-${tag}` }));
    });

    return { nodes, links };
  }, [tasks, categories]);

  // Resize canvas backing buffer to match CSS layout
  const syncCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // Rebuild graph data when tasks/categories change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    graphDataRef.current = buildGraphData(rect.width, rect.height);
  }, [tasks, categories, buildGraphData]);

  // Canvas resize observer
  useEffect(() => {
    syncCanvasSize();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => syncCanvasSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const { nodes, links } = graphDataRef.current;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const center = { x: width / 2, y: height / 2 };

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 160) {
            const f = (160 - dist) / dist * 0.1;
            a.vx -= dx * f; a.vy -= dy * f;
            b.vx += dx * f; b.vy += dy * f;
          }
        }
      }

      // Spring links
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      links.forEach(({ source, target }) => {
        const s = nodeMap.get(source), t = nodeMap.get(target);
        if (!s || !t) return;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - 100) * 0.003;
        s.vx += dx * f; s.vy += dy * f;
        t.vx -= dx * f; t.vy -= dy * f;
      });

      // Integrate
      nodes.forEach(n => {
        if (n === draggedNodeRef.current) return;
        n.vx += (center.x - n.x) * 0.0003;
        n.vy += (center.y - n.y) * 0.0003;
        n.vx *= 0.88; n.vy *= 0.88;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(n.radius + 4, Math.min(width - n.radius - 4, n.x));
        n.y = Math.max(n.radius + 4, Math.min(height - n.radius - 4, n.y));
      });

      // Clear pitch black canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw background grid lines (MAGI Hex/CRT style)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw links with NERV CRT glow effect
      links.forEach(({ source, target }) => {
        const s = nodeMap.get(source), t = nodeMap.get(target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        // Selection ring
        if (selectedNodeRef.current?.id === n.id) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
          ctx.fill();
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Outer neon glow ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.font = `${n.type === 'category' ? '700 12px' : '600 11px'} JetBrains Mono, monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 15);
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Get CSS-space mouse coords
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePos(e);
    const { nodes } = graphDataRef.current;
    const hit = nodes.find(n => Math.hypot(n.x - x, n.y - y) <= n.radius + 5);
    if (hit) {
      draggedNodeRef.current = hit;
      setSelectedNodeSync(hit);
      sounds.playClick();
    } else {
      setSelectedNodeSync(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedNodeRef.current) return;
    const { x, y } = getMousePos(e);
    draggedNodeRef.current.x = x;
    draggedNodeRef.current.y = y;
    draggedNodeRef.current.vx = 0;
    draggedNodeRef.current.vy = 0;
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
  };

  const handleDoubleClick = (e) => {
    const { x, y } = getMousePos(e);
    const { nodes } = graphDataRef.current;
    const hit = nodes.find(n => Math.hypot(n.x - x, n.y - y) <= n.radius + 5);
    if (hit?.type === 'task' && hit.taskData) {
      onEditTask(hit.taskData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className="controls-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge" style={{ background: '#ff0000', color: '#ffffff', fontWeight: 900, padding: '2px 6px', borderRadius: 0 }}>
              警報
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', color: '#ff0000', textShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
              &gt;_ NEURAL CIRCUITRY NETWORK // MAGI SYSTEM
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font)' }}>
            MAGI-01 MELCHIOR • MAGI-02 BALTHASAR • MAGI-03 CASPER // DRAG NODES TO INSPECT. DOUBLE-CLICK TASK NODE TO MODIFY DIRECTIVE.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          style={{ borderRadius: 0, borderColor: '#ff0000', color: '#ff0000' }}
          onClick={() => {
            sounds.playClick();
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) graphDataRef.current = buildGraphData(rect.width, rect.height);
          }}
        >
          <RefreshCw size={15} />
          <span>RECALIBRATE MATRIX</span>
        </button>
      </div>

      {/* Legend Container framed with corner brackets .nerv-frame */}
      <div className="nerv-frame" style={{ background: '#000000', borderColor: '#ff0000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.78rem', fontFamily: 'var(--font)', fontWeight: 700 }}>
          <span style={{ color: '#ff0000', letterSpacing: '0.05em' }}>[ NODE SYSTEM LEGEND ]</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#ff0000', display: 'inline-block', boxShadow: '0 0 6px #ff0000' }}></span>
            <span style={{ color: '#ffffff' }}>MAGI RED (#ff0000): URGENT DIRECTIVE / CAT CORE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#ff6600', display: 'inline-block', boxShadow: '0 0 6px #ff6600' }}></span>
            <span style={{ color: '#ffffff' }}>NERV AMBER (#ff6600): ACTIVE OPERATION</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#00ff66', display: 'inline-block', boxShadow: '0 0 6px #00ff66' }}></span>
            <span style={{ color: '#ffffff' }}>SYNC GREEN (#00ff66): COMPLETED CIRCUITRY</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#00ffcc', display: 'inline-block', boxShadow: '0 0 6px #00ffcc' }}></span>
            <span style={{ color: '#ffffff' }}>CHEVRON CYAN (#00ffcc): TAG MATRIX</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Container framed with corner brackets .nerv-frame */}
      <div
        ref={containerRef}
        className="nerv-frame"
        style={{ padding: 0, overflow: 'hidden', height: '550px', width: '100%', position: 'relative', background: '#000000', borderColor: '#ff0000' }}
      >
        {tasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <Network size={44} style={{ opacity: 0.3, marginBottom: '12px', color: '#ff0000' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff0000', fontFamily: 'var(--font)' }}>NO NEURAL NODES IN MATRIX</p>
            <p style={{ fontSize: '0.88rem', marginTop: '6px', fontFamily: 'var(--font)' }}>INITIALIZE TASKS OR LOAD MAGI DEMO DATA TO VIEW CIRCUIT CONNECTIONS.</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ cursor: draggedNodeRef.current ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
        )}
      </div>
    </div>
  );
}
