
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CriticalMeta } from '../CriticalMeta';

// Mock do hook
vi.mock('@/hooks/use-lcp-optimization', () => ({
  useLCPOptimization: () => ({
    optimizeForLCP: vi.fn(),
  }),
}));

describe('CriticalMeta', () => {
  it('should render without crashing', () => {
    render(<CriticalMeta />);
    expect(document.head).toBeDefined();
  });

  it('should add critical CSS to head', () => {
    render(<CriticalMeta />);
    
    // Verificar se CSS crítico foi adicionado
    const criticalStyle = document.querySelector('style[data-critical="true"]');
    expect(criticalStyle).toBeTruthy();
  });

  it('should add viewport meta tag', () => {
    render(<CriticalMeta />);
    
    // Verificar se viewport foi configurado
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
    expect(viewport?.getAttribute('content')).toContain('width=device-width');
  });
});
