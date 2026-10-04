import { describe, expect, it } from 'vitest';
import { businessWindow, calculateBusinessMetrics, type BusinessActivity } from './business-metrics';
const now = new Date('2026-10-04T15:00:00Z');
const row = (user_id: string | null, created_at: string, game_duration: number | null = null): BusinessActivity => ({ user_id, created_at, game_duration });
describe('business metrics', () => {
  it('compares disjoint weeks and deduplicates users', () => {
    const result = calculateBusinessMetrics([
      row('a', '2026-09-21T15:00:00Z'), row('a', '2026-09-22T15:00:00Z'),
      row('b', '2026-09-25T15:00:00Z'), row('a', '2026-10-01T15:00:00Z'),
      row('c', '2026-10-02T15:00:00Z'),
    ], now, 30);
    expect(result.retention_rate).toBe(50);
    expect(result.inactive_previous_week_rate).toBe(50);
    expect(result.retention_previous_users).toBe(2);
    expect(result.weekly_active_users).toBe(2);
  });
  it('puts the exact week boundary in the current week only', () => {
    const result = calculateBusinessMetrics([row('a', '2026-09-27T15:00:00Z')], now, 7);
    expect(result.weekly_active_users).toBe(1);
    expect(result.retention_previous_users).toBe(0);
    expect(result.retention_rate).toBeNull();
  });
  it('includes the previous start and excludes the query end and future', () => {
    const result = calculateBusinessMetrics([
      row('a', '2026-09-20T15:00:00Z'), row('b', '2026-10-04T15:00:00Z'), row('c', '2026-10-05T00:00:00Z'),
    ], now, 7);
    expect(result.retention_previous_users).toBe(1);
    expect(result.retention_rate).toBe(0);
    expect(result.monthly_active_users).toBe(0);
  });
  it('uses UTC day even across offsets', () => {
    const result = calculateBusinessMetrics([row('a', '2026-10-03T22:30:00-03:00'), row('b', '2026-10-03T23:59:59Z')], now, 30);
    expect(result.daily_active_users).toBe(1);
    expect(businessWindow(new Date('2026-10-04T12:00:00-03:00'), 30).dayStart).toBe(Date.parse('2026-10-04T00:00:00Z'));
  });
  it('excludes unknown, zero, negative and nonfinite duration, reports coverage', () => {
    const result = calculateBusinessMetrics([120, 240, null, 0, -1, NaN, Infinity].map((duration, i) => row(String(i), '2026-10-04T01:00:00Z', duration)), now, 30);
    expect(result.avg_session_duration).toBe(3);
    expect(result.duration_known_sessions).toBe(2);
    expect(result.duration_total_sessions).toBe(7);
  });
  it('does not invent a denominator or duration when there are no data', () => {
    const result = calculateBusinessMetrics([], now, 30);
    expect(result.monthly_active_users).toBe(0);
    expect(result.retention_rate).toBeNull();
    expect(result.engagement_score).toBeNull();
    expect(result.avg_session_duration).toBeNull();
  });
  it('rejects invalid periods and dates', () => {
    for (const days of [0, -1, 1.5, 366, NaN]) expect(() => businessWindow(now, days)).toThrow();
    expect(() => businessWindow(new Date('invalid'), 30)).toThrow();
  });
  it('ignores missing user and invalid timestamps', () => {
    const result = calculateBusinessMetrics([row(null, '2026-10-04T01:00:00Z'), row('a', 'bad')], now, 30);
    expect(result.daily_active_users).toBe(0);
  });
  it('period selection changes base, not the week-retention windows', () => {
    const rows = [row('a', '2026-09-10T00:00:00Z'), row('b', '2026-10-01T00:00:00Z')];
    expect(calculateBusinessMetrics(rows, now, 7).monthly_active_users).toBe(1);
    expect(calculateBusinessMetrics(rows, now, 30).monthly_active_users).toBe(2);
  });
});
