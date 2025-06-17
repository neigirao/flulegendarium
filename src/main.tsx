
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Simple error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    padding: '20px', 
    textAlign: 'center', 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  }}>
    <h1 style={{ color: '#800020', marginBottom: '16px' }}>Lendas do Flu</h1>
    <p style={{ color: '#666', marginBottom: '20px' }}>
      Ocorreu um erro ao carregar a aplicação: {error.message}
    </p>
    <button 
      onClick={() => window.location.reload()} 
      style={{ 
        background: '#800020', 
        color: 'white', 
        border: 'none', 
        padding: '12px 24px', 
        borderRadius: '6px', 
        cursor: 'pointer' 
      }}
    >
      Tentar Novamente
    </button>
  </div>
);

// Create root with error handling
const root = createRoot(rootElement);

// Simple render function with error boundary
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    root.render(<ErrorFallback error={error as Error} />);
  }
};

// Render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Service worker registration with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.warn('❌ SW registration failed:', error);
      });
  });
}

// Global error handlers
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
