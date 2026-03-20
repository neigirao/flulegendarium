
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Render app first, then lazy-load monitoring
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Lazy-load Sentry after first render to reduce blocking time
const initSentry = () => import('./utils/sentry').then(m => m.initializeSentry());
if (window.requestIdleCallback) {
  window.requestIdleCallback(() => initSentry());
} else {
  setTimeout(() => initSentry(), 0);
}

// ServiceWorker is handled by AdvancedServiceWorker component
