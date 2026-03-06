
CREATE TABLE public.chat_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  session_id TEXT,
  product_name TEXT,
  symptom TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat events"
  ON public.chat_analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view chat events"
  ON public.chat_analytics_events
  FOR SELECT
  USING (is_admin());

CREATE INDEX idx_chat_analytics_event_type ON public.chat_analytics_events(event_type);
CREATE INDEX idx_chat_analytics_created_at ON public.chat_analytics_events(created_at);
