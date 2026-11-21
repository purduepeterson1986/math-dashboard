import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { installTapFix } from './lib/tapFix.js';

installTapFix();

createRoot(document.getElementById('root')).render(<App />);
