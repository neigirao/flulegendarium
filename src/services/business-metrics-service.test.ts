import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ range: vi.fn(), from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));
vi.mock('@/utils/logger', () => ({ logger: { error: vi.fn() } }));
import { adminBusinessIntelligence } from './adminBusinessIntelligence';
beforeEach(() => {
  vi.clearAllMocks();
  const chain = { select: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lt: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: mocks.range };
  mocks.from.mockReturnValue(chain);
});
describe('business metrics loading', () => {
  it('rejects a database error rather than displaying zeros', async () => {
    const error = new Error('not authorized');
    mocks.range.mockResolvedValue({ data: null, error });
    await expect(adminBusinessIntelligence.getBusinessMetrics()).rejects.toBe(error);
  });
  it('paginates accessible rows and stops at a short page', async () => {
    const created_at = new Date(Date.now() - 1000).toISOString();
    const rows = Array.from({ length: 500 }, (_, i) => ({ id: String(i), user_id: 'a', created_at, game_duration: 120 }));
    mocks.range.mockResolvedValueOnce({ data: rows, error: null }).mockResolvedValueOnce({ data: [{ id: '501', user_id: 'b', created_at, game_duration: null }], error: null });
    const result = await adminBusinessIntelligence.getBusinessMetrics();
    expect(mocks.range.mock.calls).toEqual([[0, 499], [500, 999]]);
    expect(result.monthly_active_users).toBe(2);
    expect(result.scope).toBe('accessible_rows');
  });
  it('rejects missing data even without a provider error', async () => {
    mocks.range.mockResolvedValue({ data: null, error: null });
    await expect(adminBusinessIntelligence.getBusinessMetrics()).rejects.toThrow('consulta sem resposta');
  });
  it('rejects capped data rather than claiming it is a complete aggregate', async () => {
    const rows = Array.from({ length: 500 }, () => ({ user_id: 'a', created_at: new Date().toISOString(), game_duration: null }));
    mocks.range.mockResolvedValue({ data: rows, error: null });
    await expect(adminBusinessIntelligence.getBusinessMetrics()).rejects.toThrow('20.000');
    expect(mocks.range).toHaveBeenCalledTimes(40);
  });
});
