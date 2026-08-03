import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GraphView({ tasks, categories, onEditTask }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const graphDataRef = useRef({ nodes: [], links: [] });
  const draggedNodeRef = useRef(null);
  const animRef = useRef(null);

  const buildGraphData = useCallback((width, height) => {
    const nodes = [];
    const links = [];
    const cx = width / 2;
    const cy = height / 2;

    // Category nodes — placed in a ring around center
    categories.forEach((cat, i) => {
      const angle = (i / categories.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.25;
      nodes.push({
        id: `cat-${cat.id}`,
        label: cat.name,
        type: 'category',
        color: cat.color,
        radius: 20,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0
      });
    });

    // Tag nodes
    const tagSet = new Set();
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag)));
    const tagArr = Array.from(tagSet);
    tagArr.forEach((tag, i) => {
      const angle = (i / tagArr.length) * Math.PI * 2 + 0.5;
      const r = Math.min(width, height) * 0.35;
      nodes.push({
        id: `tag-${tag}`,
        label: `#${tag}`,
        type: 'tag',
        color: '#a855f7',
        radius: 11,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0
      });
    });

    // Task nodes
    const pColors = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' };
    tasks.forEach((t, i) => {
      const isCompleted = t.status === 'completed';
      const color = isCompleted ? '#52525b' : (pColors[t.priority] || '#3b82f6');
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

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw links
      links.forEach(({ source, target }) => {
        const s = nodeMap.get(source), t = nodeMap.get(target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        // Selection ring
        if (selectedNode?.id === n.id) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = `${n.type === 'category' ? '600 12px' : '500 11px'} Inter, sans-serif`;
        ctx.fillStyle = '#d4d4d8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 14);
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selectedNode]);

  // Get CSS-space mouse coords (accounts for devicePixelRatio)
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
      setSelectedNode(hit);
      sounds.playClick();
    } else {
      setSelectedNode(null);
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
    if (draggedNodeRef.current?.type === 'task' && draggedNodeRef.current.taskData) {
      // Only open editor if we didn't drag far (treat as click)
    }
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
          <h2>Task Relationship Graph</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Drag nodes to explore. Double-click a task node to edit it.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => {
            sounds.playClick();
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) graphDataRef.current = buildGraphData(rect.width, rect.height);
          }}
        >
          <RefreshCw size={15} />
          <span>Reset Layout</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className="card"
        style={{ padding: 0, overflow: 'hidden', height: '550px', width: '100%', position: 'relative' }}
      >
        {tasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <Network size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No task nodes in graph</p>
            <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Create tasks or load demo data to view graph connections.</p>
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
