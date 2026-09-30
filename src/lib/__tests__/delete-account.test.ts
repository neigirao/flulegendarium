import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), signOut: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: mocks.rpc, auth: { signOut: mocks.signOut } } }));
import { deleteAccount } from '../delete-account';
describe('deleteAccount', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); mocks.rpc.mockResolvedValue({ error: null }); mocks.signOut.mockResolvedValue({ error: null }); });
  it('calls only the no-argument self-delete RPC and signs out locally after success', async () => {
    localStorage.setItem('game-store', 'private'); sessionStorage.setItem('last_game_result', 'private');
    await deleteAccount();
    expect(mocks.rpc).toHaveBeenCalledWith('delete_my_account');
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(localStorage.getItem('game-store')).toBeNull();
    expect(sessionStorage.getItem('last_game_result')).toBeNull();
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.signOut.mock.invocationCallOrder[0]);
  });
  it('keeps session and local data on RPC failure', async () => {
    localStorage.setItem('game-store', 'private'); mocks.rpc.mockResolvedValue({ error: { message: 'backend error' } });
    await expect(deleteAccount()).rejects.toThrow('Seus dados foram mantidos');
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(localStorage.getItem('game-store')).toBe('private');
  });
});
