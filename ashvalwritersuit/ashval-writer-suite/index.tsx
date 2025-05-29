import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './services/themeService'; // Theme initialization is handled in App.tsx and index.html script

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);