import React from 'react';
import { Zap, Search, Plus, Sun, Moon, Volume2, VolumeX, Download, Upload, Command, Sparkles } from 'lucide-react';
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
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon"><Zap size={14} /></div>
        <span className="brand-title">&gt;_ TASKFLOW</span>
      </div>

      <div className="nav-search">
        <div className="search-input-wrapper">
          <Search size={14} />
          <input
            type="text" className="search-input"
            placeholder="Search... ( / )"
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
          <option value="unit01">Unit-01</option>
          <option value="unit00">Unit-00</option>
          <option value="terminal">Terminal</option>
          <option value="unit02">Unit-02</option>
          <option value="warning">Warning</option>
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
          <span>NEW</span>
        </button>
      </div>
    </header>
  );
}
