-- Backend semantic layer for admin error metrics (daily)

CREATE OR REPLACE FUNCTION public.get_error_metrics_daily(p_days integer DEFAULT 7)
RETURNS TABLE (
  date date,
  total_errors integer,
  error_rate integer,
  resolved_errors integer,
  avg_resolution_time integer,
  top_errors jsonb,
  data_quality text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH day_range AS (
  SELECT generate_series(
    (CURRENT_DATE - GREATEST(p_days, 1) + 1)::date,
    CURRENT_DATE::date,
    INTERVAL '1 day'
  )::date AS day
),
bugs_by_day AS (
  SELECT
    b.created_at::date AS day,
    CASE
      WHEN lower(b.description) LIKE '%carregamento%' OR lower(b.description) LIKE '%loading%' THEN 'Carregamento'
      WHEN lower(b.description) LIKE '%imagem%' OR lower(b.description) LIKE '%image%' THEN 'Imagens'
      WHEN lower(b.description) LIKE '%login%' OR lower(b.description) LIKE '%auth%' THEN 'Autenticação'
      WHEN lower(b.description) LIKE '%pontuação%' OR lower(b.description) LIKE '%score%' THEN 'Pontuação'
      ELSE 'Outros'
    END AS error_type,
    count(*)::int AS cnt
  FROM public.bugs b
  WHERE b.created_at >= (CURRENT_DATE - GREATEST(p_days, 1) + 1)
  GROUP BY 1, 2
),
bugs_totals AS (
  SELECT day, COALESCE(sum(cnt), 0)::int AS total_errors
  FROM bugs_by_day
  GROUP BY day
),
sessions_by_day AS (
  SELECT created_at::date AS day, count(*)::int AS sessions
  FROM public.user_game_history
  WHERE created_at >= (CURRENT_DATE - GREATEST(p_days, 1) + 1)
  GROUP BY 1
),
resolved_technical_tickets AS (
  SELECT
    st.updated_at::date AS day,
    count(*)::int AS resolved_errors,
    COALESCE(avg(EXTRACT(EPOCH FROM (st.updated_at - st.created_at)) / 3600), 0)::int AS avg_resolution_time
  FROM public.support_tickets st
  WHERE st.updated_at >= (CURRENT_DATE - GREATEST(p_days, 1) + 1)
    AND st.category = 'technical'
    AND st.status IN ('resolved', 'closed')
  GROUP BY 1
),
top_errors_by_day AS (
  SELECT
    t.day,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'error_type', t.error_type,
          'count', t.cnt,
          'percentage', t.percentage
        )
        ORDER BY t.cnt DESC
      ),
      '[]'::jsonb
    ) AS top_errors
  FROM (
    SELECT
      b.day,
      b.error_type,
      b.cnt,
      CASE
        WHEN bt.total_errors > 0 THEN round((b.cnt::numeric / bt.total_errors::numeric) * 100)::int
        ELSE 0
      END AS percentage,
      row_number() OVER (PARTITION BY b.day ORDER BY b.cnt DESC) AS rn
    FROM bugs_by_day b
    JOIN bugs_totals bt ON bt.day = b.day
  ) t
  WHERE t.rn <= 5
  GROUP BY t.day
)
SELECT
  d.day AS date,
  COALESCE(bt.total_errors, 0) AS total_errors,
  CASE
    WHEN COALESCE(sb.sessions, 0) > 0 THEN round((COALESCE(bt.total_errors, 0)::numeric / sb.sessions::numeric) * 100)::int
    ELSE 0
  END AS error_rate,
  COALESCE(rt.resolved_errors, 0) AS resolved_errors,
  COALESCE(rt.avg_resolution_time, 0) AS avg_resolution_time,
  COALESCE(te.top_errors, '[]'::jsonb) AS top_errors,
  CASE
    WHEN COALESCE(sb.sessions, 0) > 0 THEN 'real'
    WHEN COALESCE(bt.total_errors, 0) > 0 THEN 'partial'
    ELSE 'empty'
  END AS data_quality
FROM day_range d
LEFT JOIN bugs_totals bt ON bt.day = d.day
LEFT JOIN sessions_by_day sb ON sb.day = d.day
LEFT JOIN resolved_technical_tickets rt ON rt.day = d.day
LEFT JOIN top_errors_by_day te ON te.day = d.day
ORDER BY d.day ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_error_metrics_daily(integer) TO anon, authenticated;
