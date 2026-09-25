
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CriticalMeta } from '../CriticalMeta';

// Mock do hook
vi.mock('@/hooks/use-lcp-optimization', () => ({
  useLCPOptimization: () => ({
    optimizeForLCP: vi.fn(),
    measureLCP: vi.fn(() => undefined),
  }),
}));

describe('CriticalMeta', () => {
  it('should render without crashing', () => {
    render(<CriticalMeta />);
    expect(document.head).toBeDefined();
  });

  // Critical CSS is in index.html at build time, not inserted by this component.

  it('should add viewport meta tag', () => {
    render(<CriticalMeta />);
    
    // Verificar se viewport foi configurado
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
    expect(viewport?.getAttribute('content')).toContain('width=device-width');
  });
});
