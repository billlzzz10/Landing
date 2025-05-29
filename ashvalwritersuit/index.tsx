import React from 'react';
import ReactDOM from 'react-do';
import { App } from './NoteTaskApp'; // Changed to import App

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to. Ensure an element with id='root' exists in your HTML.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App /> {/* Changed to render App */}
  </React.StrictMode>
);