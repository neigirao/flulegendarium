import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { featureFlags } from './config/feature-flags'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Lazy-load Sentry well after initial render to reduce critical-chain JS
const scheduleSentryInit = () => {
  if (!featureFlags.enableSentry) return;

  const initSentry = () => import('./utils/sentry').then(m => m.initializeSentry());

  const run = () => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => initSentry(), { timeout: 12000 });
    } else {
      setTimeout(() => initSentry(), 8000);
    }
  };

  if (document.readyState === 'complete') {
    setTimeout(run, 6000);
  } else {
    window.addEventListener('load', () => setTimeout(run, 6000), { once: true });
  }
};

scheduleSentryInit();
