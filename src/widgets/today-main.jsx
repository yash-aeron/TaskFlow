import React from 'react';
import ReactDOM from 'react-dom/client';
import TodayWidget from './TodayWidget';
import './widget.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TodayWidget />
  </React.StrictMode>
);
