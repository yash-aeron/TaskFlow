import React from 'react';
import { Search, Plus, Sun, Moon, Volume2, VolumeX, Download, Upload, Command, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ 
  searchQuery, setSearchQuery, onOpenNewTask, 
  theme, setTheme, soundEnabled, setSoundEnabled,
  themeMode = 'nerv', setThemeMode,
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

  const toggleThemeMode = () => {
    sounds.playClick();
    const nextMode = themeMode === 'nerv' ? 'persona' : 'nerv';
    if (setThemeMode) setThemeMode(nextMode);
  };

  const isPersona = themeMode === 'persona';

  return (
    <header className="navbar" style={{ position: 'relative' }}>
      <div className={isPersona ? "" : "hazard-stripe-red"} style={isPersona ? { height: '3px', position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #e60012, #00e5ff)' } : { height: '4px', position: 'absolute', top: 0, left: 0, right: 0 }} />
      
      <div className="nav-brand">
        {isPersona ? (
          <div 
            style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              padding: '2px 8px', background: '#e60012', color: '#ffffff', 
              fontWeight: '900', fontSize: '12px', fontFamily: "'Impact', sans-serif",
              letterSpacing: '1px', transform: 'skewX(-10deg)', border: '1px solid #ffffff'
            }}
          >
            P5+P3
          </div>
        ) : (
          <div className="nerv-emblem" title="NERV">
            <span className="leaf" />
          </div>
        )}

        <span className={`brand-title ${isPersona ? 'persona-glitch' : ''}`} style={isPersona ? { color: '#00e5ff', fontFamily: "'Impact', sans-serif", letterSpacing: '0.1em' } : {}}>
          {isPersona ? "♠ PERSONA PHANTOM RELOAD" : "警報 NERV MAGI SYSTEM"}
        </span>
      </div>

      <div className="nav-search">
        <div className="search-input-wrapper">
          <Search size={14} />
          <input
            type="text" className="search-input"
            placeholder={isPersona ? "Search... ( / ) TAKES YOUR TIME" : "[ 警報 ] ENTER COMMAND / TARGET SEARCH..."}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            id="task-search-input"
          />
        </div>
      </div>

      <div className="nav-actions">
        {/* THEME MODE SWITCHER BUTTON */}
        <button 
          className="btn" 
          onClick={toggleThemeMode} 
          title="Switch UI Theme (NERV MAGI ↔ PERSONA P5+P3 RELOAD)"
          style={isPersona ? {
            background: '#e60012', color: '#ffffff', border: '1px solid #00e5ff',
            padding: '4px 10px', fontSize: '11px', fontWeight: '900', fontFamily: "'Impact', sans-serif",
            transform: 'skewX(-8deg)'
          } : {
            background: '#ff9900', color: '#ffffff', border: '1px solid #ffffff',
            padding: '4px 10px', fontSize: '11px', fontWeight: '900', fontFamily: 'var(--font)'
          }}
        >
          <RefreshCw size={13} style={{ marginRight: '4px' }} />
          <span>{isPersona ? '♠ PERSONA RELOAD' : '[ 警報 ] NERV UI'}</span>
        </button>

        <select 
          value={accent} onChange={(e) => { setAccent(e.target.value); }}
          className="form-select"
          style={{ padding: '3px 6px', fontSize: '11px', width: 'auto', borderRadius: '0px', fontFamily: 'var(--font)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
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
          <span>{isPersona ? 'INITIALIZE' : '[ 警報 ] INITIALIZE'}</span>
        </button>
      </div>
    </header>
  );
}
