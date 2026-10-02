import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppleSignInArt } from './AppleSignInArt';
describe('Apple artwork', () => {
  it('uses Apple-hosted artwork with an accessible label', () => {
    render(<AppleSignInArt />);
    expect(screen.getByRole('img', { name: 'Entrar com Apple' }).getAttribute('src')).toContain('https://appleid.cdn-apple.com/appleid/button?');
  });
  it('retains the sign-in label if artwork fails to load', () => {
    render(<AppleSignInArt />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('Entrar com Apple')).toBeTruthy();
  });
});
