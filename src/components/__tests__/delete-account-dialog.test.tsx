import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ deleteAccount: vi.fn(), clear: vi.fn(), error: vi.fn() }));
vi.mock('@/lib/delete-account', () => ({ deleteAccount: mocks.deleteAccount }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ clear: mocks.clear }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.error } }));
import { DeleteAccountDialog } from '../delete-account-dialog';
describe('DeleteAccountDialog', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('requires the exact confirmation and cancellation never deletes', () => {
    render(<DeleteAccountDialog />); fireEvent.click(screen.getByText('Apagar minha conta'));
    expect(screen.getByText('Apagar definitivamente')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Digite APAGAR para confirmar'), { target: { value: 'apagar' } });
    expect(screen.getByText('Apagar definitivamente')).toBeDisabled();
    fireEvent.click(screen.getByText('Cancelar')); expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });
  it('blocks double submission while busy', async () => {
    mocks.deleteAccount.mockReturnValue(new Promise(() => {}));
    render(<DeleteAccountDialog />); fireEvent.click(screen.getByText('Apagar minha conta'));
    fireEvent.change(screen.getByLabelText('Digite APAGAR para confirmar'), { target: { value: 'APAGAR' } });
    fireEvent.click(screen.getByText('Apagar definitivamente'));
    expect(screen.getByText('Apagando...')).toBeDisabled();
    fireEvent.click(screen.getByText('Apagando...'));
    expect(mocks.deleteAccount).toHaveBeenCalledTimes(1);
  });
  it('keeps the dialog open and allows retry after failure', async () => {
    mocks.deleteAccount.mockRejectedValue(new Error('Falhou'));
    render(<DeleteAccountDialog />); fireEvent.click(screen.getByText('Apagar minha conta'));
    fireEvent.change(screen.getByLabelText('Digite APAGAR para confirmar'), { target: { value: 'APAGAR' } });
    fireEvent.click(screen.getByText('Apagar definitivamente'));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Falhou'));
    expect(screen.getByText('Apagar definitivamente')).toBeEnabled(); expect(mocks.clear).not.toHaveBeenCalled();
  });
});
