import React from 'react';
import { Search, Plus, Sun, Moon, Volume2, VolumeX, Download, Upload, Command, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ 
  searchQuery, setSearchQuery, onOpenNewTask, 
  theme, setTheme, soundEnabled, setSoundEnabled,
  accent, setAccent, onExportData, onImportData,
  onOpenShortcuts, onLoadDemoData
}) {
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => onImportData(event.target.result);
    reader.readAsText(file);
  };

  return (
    <header className="navbar" style={{ position: 'relative' }}>
      <div className="hazard-stripe-red" style={{ height: '4px', position: 'absolute', top: 0, left: 0, right: 0 }} />
      <div className="nav-brand">
        <div 
          className="brand-icon hex-magi" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '38px', 
            height: '24px', 
            background: '#ff0000', 
            color: '#000000', 
            fontWeight: '900', 
            fontSize: '11px', 
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', 
            letterSpacing: '1px',
            fontFamily: 'var(--font-heading, sans-serif)'
          }}
        >
          MAGI
        </div>
        <span className="brand-title">警報 NERV MAGI SYSTEM</span>
      </div>

      <div className="nav-search">
        <div className="search-input-wrapper">
          <Search size={14} />
          <input
            type="text" className="search-input"
            placeholder="[ 警報 ] ENTER COMMAND / TARGET SEARCH..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            id="task-search-input"
          />
        </div>
      </div>

      <div className="nav-actions">
        <select 
          value={accent} onChange={(e) => { setAccent(e.target.value); }}
          className="form-select"
          style={{ padding: '3px 6px', fontSize: '11px', width: 'auto', borderRadius: '4px', fontFamily: 'var(--font)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          <option value="magi_red">MAGI RED (Melchior-1)</option>
          <option value="nerv_amber">NERV AMBER (Tokyo-3)</option>
          <option value="terminal_cyan">TERMINAL CYAN (Sync)</option>
          <option value="terminal_green">TERMINAL GREEN (CRT)</option>
          <option value="seele_monolith">SEELE MONOLITH (Black)</option>
        </select>

        <button className="btn-icon" onClick={onLoadDemoData} title="Load demo data">
          <Sparkles size={14} />
        </button>
        <button className="btn-icon" onClick={onOpenShortcuts} title="Shortcuts (?)">
          <Command size={14} />
        </button>
        <button className="btn-icon" onClick={() => { const s = sounds.toggleSound(); setSoundEnabled(s); }} title="Sound">
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button className="btn-icon" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} title="Theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className="btn-icon" onClick={onExportData} title="Export"><Download size={14} /></button>
        <button className="btn-icon" onClick={() => fileInputRef.current?.click()} title="Import"><Upload size={14} /></button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileUpload} />
        
        <button className="btn btn-primary" onClick={onOpenNewTask}>
          <Plus size={14} />
          <span>[ 警報 ] INITIALIZE</span>
        </button>
      </div>
    </header>
  );
}
