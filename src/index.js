import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { applyResizeObserverPolyfill } from './utils/ResizeObserverPolyfill';
import './index.css';

const reportError = console.error;
console.error = (...args) => {
  if (/ResizeObserver loop completed with undelivered notifications/.test(args[0])) {
    return;
  }
  reportError(...args);
};

applyResizeObserverPolyfill();

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);