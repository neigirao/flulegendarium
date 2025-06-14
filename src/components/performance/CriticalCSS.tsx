
import { useEffect } from 'react';

export const CriticalCSS = () => {
  useEffect(() => {
    // Inline critical CSS for above-the-fold content
    const style = document.createElement('style');
    style.textContent = `
      /* Critical CSS for initial paint */
      .critical-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(to bottom, #10b98150, #ffffff);
      }
      
      .critical-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #800020;
        border-radius: 50%;
        animation: critical-spin 1s linear infinite;
      }
      
      @keyframes critical-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Prevent layout shift */
      .game-container {
        min-height: 600px;
      }
      
      .player-image-container {
        aspect-ratio: 1;
        min-height: 300px;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
};
