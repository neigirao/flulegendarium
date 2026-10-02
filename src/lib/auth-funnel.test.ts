import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authStart, authResolvePendingOnLoad, medirEntradaNativa, authErrorCode } from './auth-funnel';
describe('private auth funnel', () => {
  beforeEach(() => { sessionStorage.clear(); window.gtag = vi.fn(); });
  it('resolves a pending provider once without identifiers', () => {
    authStart('apple', 'web');
    authResolvePendingOnLoad(true); authResolvePendingOnLoad(true);
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'auth_success', { provider: 'apple', surface: 'web' });
  });
  it('ignores forged and expired storage', () => {
    sessionStorage.setItem('auth_pending', JSON.stringify({provider:'private@example.com',t:Date.now()}));
    authResolvePendingOnLoad(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });
  it('maps errors to fixed codes and catches native failures', async () => {
    expect(authErrorCode('network secret@example.com')).toBe('network');
    expect(await medirEntradaNativa('google', async () => { throw new Error('secret'); })).toBe('falha_inesperada');
    expect(window.gtag).toHaveBeenLastCalledWith('event', 'auth_error', {provider:'google', surface:'native', error_code:'unknown'});
  });
});
