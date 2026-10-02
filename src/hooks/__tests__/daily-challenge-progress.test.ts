import { describe, expect, it } from 'vitest';
import { challengeDay, nextChallengeProgress } from '../use-daily-challenges-module';
describe('challenge metric semantics', () => {
  it('sums counts, not consecutive streak samples or percentages', () => {
    expect(nextChallengeProgress('games_played', 1, 1)).toBe(2);
    expect(nextChallengeProgress('streak', 2, 3)).toBe(3);
    expect(nextChallengeProgress('max_streak', 4, 2)).toBe(4);
    expect(nextChallengeProgress('accuracy', 50, 80)).toBe(80);
  });
  it('uses the Brazilian day after UTC midnight', () => {
    expect(challengeDay(new Date('2026-10-02T01:00:00Z'))).toBe('2026-10-01');
  });
});
