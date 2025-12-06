
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { GuessForm } from '../guess-game/GuessForm';

// Mock dependencies
vi.mock('@/hooks/analytics', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
  }),
}));

describe('GuessForm', () => {
  const defaultProps = {
    disabled: false,
    onSubmitGuess: vi.fn(),
    isProcessing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form with input and submit button', () => {
      const { container } = render(<GuessForm {...defaultProps} />);

      expect(container.querySelector('[data-testid="guess-form"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="guess-input"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="guess-submit-btn"]')).toBeTruthy();
    });

    it('should display placeholder text', () => {
      const { container } = render(<GuessForm {...defaultProps} />);
      const input = container.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Digite o nome do jogador...');
    });
  });

  describe('Input Validation', () => {
    it('should disable submit button when input is empty', () => {
      const { container } = render(<GuessForm {...defaultProps} />);
      const submitButton = container.querySelector('[data-testid="guess-submit-btn"]') as HTMLButtonElement;
      expect(submitButton?.disabled).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      const { container } = render(<GuessForm {...defaultProps} disabled={true} />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input?.disabled).toBe(true);
    });

    it('should disable submit button when disabled prop is true', () => {
      const { container } = render(<GuessForm {...defaultProps} disabled={true} />);
      const submitButton = container.querySelector('[data-testid="guess-submit-btn"]') as HTMLButtonElement;
      expect(submitButton?.disabled).toBe(true);
    });
  });

  describe('Processing State', () => {
    it('should disable submit button when processing', () => {
      const { container } = render(<GuessForm {...defaultProps} isProcessing={true} />);
      const submitButton = container.querySelector('[data-testid="guess-submit-btn"]') as HTMLButtonElement;
      expect(submitButton?.disabled).toBe(true);
    });

    it('should disable input when processing', () => {
      const { container } = render(<GuessForm {...defaultProps} isProcessing={true} />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input?.disabled).toBe(true);
    });
  });
});
