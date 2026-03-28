import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import appStylesheetUrl from './index.css?url'

const loadDeferredStyles = () => {
  if (document.querySelector('link[data-app-styles="true"]')) return;

  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'style';
  preload.href = appStylesheetUrl;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = appStylesheetUrl;
  stylesheet.setAttribute('data-app-styles', 'true');

  preload.onload = () => {
    document.head.appendChild(stylesheet);
    preload.remove();
  };

  preload.onerror = () => {
    // Fallback: still try to apply styles if preload is blocked
    document.head.appendChild(stylesheet);
    preload.remove();
  };

  document.head.appendChild(preload);
};

const scheduleDeferredStyles = () => {
  // Keep first paint focused on critical inline CSS, then load full stylesheet
  if ('requestAnimationFrame' in window) {
    window.requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => number })
          .requestIdleCallback(loadDeferredStyles);
        return;
      }

      window.setTimeout(loadDeferredStyles, 0);
    });
    return;
  }

  window.setTimeout(loadDeferredStyles, 0);
};

// Render app first, then lazy-load monitoring and non-critical styles
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

scheduleDeferredStyles();

// Lazy-load Sentry well after initial render to reduce critical-chain JS
const scheduleSentryInit = () => {
  if (!import.meta.env.PROD) return;

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
