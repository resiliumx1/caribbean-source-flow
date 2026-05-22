
-- chat_analytics_events INSERT: add basic validation instead of always-true
DROP POLICY IF EXISTS "Anyone can insert chat events" ON public.chat_analytics_events;
CREATE POLICY "Anyone can insert chat events"
  ON public.chat_analytics_events FOR INSERT
  WITH CHECK (
    event_type IS NOT NULL
    AND length(event_type) BETWEEN 1 AND 100
    AND (session_id IS NULL OR length(session_id) BETWEEN 1 AND 100)
  );

-- Restore execute on helpers used inside RLS policies (otherwise policies fail to evaluate)
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_order_owner_or_admin(uuid) TO anon, authenticated;
