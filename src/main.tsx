
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting application initialization...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log('✅ Root element found');

// Simple error fallback component
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

// Simple render function
const renderApp = () => {
  try {
    console.log('🎨 Rendering React app...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('💥 Failed to render app:', error);
    root.render(<ErrorFallback error={error as Error} />);
  }
};

// Render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Simplified global error handlers
window.addEventListener('error', (event) => {
  console.error('💥 Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

console.log('🎯 Main.tsx initialization complete');
