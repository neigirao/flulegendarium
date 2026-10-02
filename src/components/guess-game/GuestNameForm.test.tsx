import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestNameForm } from './GuestNameForm';
describe('Guest name entry', () => {
  it('explains why starting is disabled and enables it for a name', () => {
    const submit = vi.fn();
    render(<GuestNameForm onNameSubmitted={submit} onCancel={() => {}} />);
    const start = screen.getByRole('button', { name: 'Começar Jogo' }) as HTMLButtonElement;
    expect(start.disabled).toBe(true);
    expect(start.getAttribute('aria-describedby')).toBe('guest-name-help');
    fireEvent.change(screen.getByLabelText('Seu nome'), { target: { value: ' Tricolor ' } });
    expect(start.disabled).toBe(false);
    fireEvent.click(start);
    expect(submit).toHaveBeenCalledWith('Tricolor');
  });
});
