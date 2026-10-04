const DAY_MS = 86_400_000;
export interface BusinessActivity {
  user_id: string | null;
  created_at: string;
  game_duration: number | null;
}
export interface BusinessMetrics {
  monthly_active_users: number;
  daily_active_users: number;
  weekly_active_users: number;
  engagement_score: number | null;
  retention_rate: number | null;
  inactive_previous_week_rate: number | null;
  avg_session_duration: number | null;
  duration_known_sessions: number;
  duration_total_sessions: number;
  retention_previous_users: number;
  last_updated: string;
  period_days: number;
  scope: 'accessible_rows';
}
export function businessWindow(now: Date, days: number) {
  const end = now.getTime();
  if (!Number.isFinite(end) || !Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Período inválido');
  }
  return {
    end,
    dayStart: Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    currentWeekStart: end - 7 * DAY_MS,
    previousWeekStart: end - 14 * DAY_MS,
    periodStart: end - days * DAY_MS,
    queryStart: end - Math.max(days, 14) * DAY_MS,
  };
}
/** Activity retention, not account churn. All windows are half-open [start, end). */
export function calculateBusinessMetrics(rows: BusinessActivity[], now: Date, days: number): BusinessMetrics {
  const w = businessWindow(now, days);
  const usable = rows.flatMap(row => {
    const ts = Date.parse(row.created_at);
    return row.user_id && Number.isFinite(ts) && ts >= w.queryStart && ts < w.end
      ? [{ ...row, ts }] : [];
  });
  const daily = usable.filter(row => row.ts >= w.dayStart);
  const weekly = usable.filter(row => row.ts >= w.currentWeekStart);
  const previous = usable.filter(row => row.ts >= w.previousWeekStart && row.ts < w.currentWeekStart);
  const period = usable.filter(row => row.ts >= w.periodStart);
  const users = (items: typeof usable) => new Set(items.map(row => row.user_id));
  const dailyUsers = users(daily), weeklyUsers = users(weekly), previousUsers = users(previous), periodUsers = users(period);
  const retained = [...previousUsers].filter(id => weeklyUsers.has(id)).length;
  const retention = previousUsers.size ? Math.round(retained / previousUsers.size * 100) : null;
  const durations = daily.flatMap(row => typeof row.game_duration === 'number' && Number.isFinite(row.game_duration) && row.game_duration > 0 ? [row.game_duration] : []);
  return {
    monthly_active_users: periodUsers.size,
    daily_active_users: dailyUsers.size,
    weekly_active_users: weeklyUsers.size,
    engagement_score: periodUsers.size ? Math.round(dailyUsers.size / periodUsers.size * 100) : null,
    retention_rate: retention,
    inactive_previous_week_rate: retention === null ? null : 100 - retention,
    avg_session_duration: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length / 60) : null,
    duration_known_sessions: durations.length,
    duration_total_sessions: daily.length,
    retention_previous_users: previousUsers.size,
    last_updated: now.toISOString(),
    period_days: days,
    scope: 'accessible_rows',
  };
}
