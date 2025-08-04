
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSentry } from './utils/sentry'

// Initialize monitoring and app
(() => {
  initializeSentry();

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
})();

// ServiceWorker is handled by AdvancedServiceWorker component
