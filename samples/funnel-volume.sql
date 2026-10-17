-- Working, query-level SQL. This is the level I used on Mixpanel / Zendesk extracts:
-- SELECT, WHERE, GROUP BY, HAVING, COUNT(DISTINCT). Not warehouse modelling.
-- Table and numbers are invented so no employer data leaves the building.

-- Tickets per day, last 7 days, with unique requesters.
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS tickets,
  COUNT(DISTINCT requester_id) AS unique_users
FROM tickets
WHERE created_at >= CURRENT_DATE - INTERVAL '7' DAY
GROUP BY DATE(created_at)
ORDER BY day;

-- Funnel drop: sessions that viewed pricing but did not reach checkout.
SELECT
  DATE(e.event_time) AS day,
  COUNT(DISTINCT CASE WHEN e.event_name = 'pricing_viewed' THEN e.user_id END) AS viewed_pricing,
  COUNT(DISTINCT CASE WHEN e.event_name = 'checkout_started' THEN e.user_id END) AS started_checkout,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN e.event_name = 'checkout_started' THEN e.user_id END)
    / NULLIF(COUNT(DISTINCT CASE WHEN e.event_name = 'pricing_viewed' THEN e.user_id END), 0),
    1
  ) AS checkout_start_rate_pct
FROM events e
WHERE e.event_time >= CURRENT_DATE - INTERVAL '7' DAY
  AND e.event_name IN ('pricing_viewed', 'checkout_started')
GROUP BY DATE(e.event_time)
HAVING COUNT(DISTINCT CASE WHEN e.event_name = 'pricing_viewed' THEN e.user_id END) > 0
ORDER BY day;
