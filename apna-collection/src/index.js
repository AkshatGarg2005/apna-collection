import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create a script element to import Font Awesome
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(fontAwesomeScript);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);