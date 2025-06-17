
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
const startTime = performance.now();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Optimize React rendering
const root = createRoot(rootElement, {
  // Enable concurrent features for better performance
  unstable_strictMode: true
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track app initialization time
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  console.log(`🚀 App initialized in ${loadTime.toFixed(2)}ms`);
  
  // Track to analytics if available
  if (window.gtag) {
    window.gtag('event', 'app_load_time', {
      event_category: 'Performance', 
      value: Math.round(loadTime)
    });
  }
});

// Register service worker for PWA functionality with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered successfully');
        
        // Update available
        registration.addEventListener('updatefound', () => {
          console.log('🔄 SW update available');
        });
      })
      .catch((registrationError) => {
        console.warn('⚠️ SW registration failed:', registrationError);
      });
  });
}

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  // Monitor long tasks that block the main thread
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          
          if (window.gtag) {
            window.gtag('event', 'long_task', {
              event_category: 'Performance',
              value: Math.round(entry.duration)
            });
          }
        }
      });
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.warn('Long task observer not supported');
  }
}

// Memory leak detection in development
if (process.env.NODE_ENV === 'development') {
  let memoryCheckInterval: number;
  
  if ('memory' in performance) {
    memoryCheckInterval = window.setInterval(() => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (memoryUsage > 0.8) {
        console.warn(`⚠️ High memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
      }
    }, 30000); // Check every 30 seconds
  }
  
  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (memoryCheckInterval) {
      clearInterval(memoryCheckInterval);
    }
  });
}
