import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ update: vi.fn(), profile: { play_streak: 2, best_play_streak: 3, last_play_date: '2026-09-30' } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({user:{id:'test-user'}}) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {from: () => ({
 select: () => ({eq: () => ({single: async () => ({data:mocks.profile,error:null})})}),
 update: (...a: unknown[]) => { mocks.update(...a); return {eq: async () => ({error:null})}; }
})} }));
import { usePlayStreak } from '../use-play-streak';
describe('real play streak', () => {
 beforeEach(() => { vi.useFakeTimers({toFake:['Date']}); vi.setSystemTime(new Date('2026-10-02T01:00:00Z')); mocks.update.mockClear(); });
 it('opening the menu reads only; a completed game advances in Brazilian day', async () => {
  const {result}=renderHook(()=>usePlayStreak());
  await waitFor(()=>expect(result.current.isLoading).toBe(false));
  expect(mocks.update).not.toHaveBeenCalled();
  expect(result.current.streak).toBe(2);
  await act(async()=>result.current.recordCompletedGame());
  expect(mocks.update).toHaveBeenCalledWith({play_streak:3,best_play_streak:3,last_play_date:'2026-10-01'});
  vi.useRealTimers();
 });
});
