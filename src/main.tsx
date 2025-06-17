
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance optimization: Preload critical modules
const preloadCriticalModules = () => {
  // Preload React Router
  import('react-router-dom').catch(() => {});
  // Preload Supabase client
  import('@/integrations/supabase/client').catch(() => {});
  // Preload TanStack Query
  import('@tanstack/react-query').catch(() => {});
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Optimize initial render with concurrent features
const root = createRoot(rootElement);

// Start preloading critical modules
preloadCriticalModules();

// Enhanced error boundary for better UX
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback rendering
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #800020; margin-bottom: 16px;">Lendas do Flu</h1>
        <p style="color: #666; margin-bottom: 20px;">Ocorreu um erro ao carregar a aplicação.</p>
        <button onclick="window.location.reload()" style="background: #800020; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
};

// Render app with performance monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Register service worker for PWA functionality with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered successfully:', registration.scope);
        
        // Update service worker when available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New service worker available');
                // You could show a toast here to notify users of updates
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('❌ SW registration failed:', error);
      });
  });
}

// Performance monitoring
if (typeof window !== 'undefined') {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('🐌 Long task detected:', {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime)
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported');
    }
  }

  // Report critical errors
  window.addEventListener('error', (event) => {
    console.error('💥 Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
  });
}
