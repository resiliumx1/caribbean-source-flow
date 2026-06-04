CREATE TABLE public.email_send_failures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid,
  email_type text NOT NULL,
  recipient text,
  error_message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_send_failures TO authenticated;
GRANT ALL ON public.email_send_failures TO service_role;

ALTER TABLE public.email_send_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email failures"
  ON public.email_send_failures FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update email failures"
  ON public.email_send_failures FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete email failures"
  ON public.email_send_failures FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE INDEX idx_email_send_failures_order_id ON public.email_send_failures(order_id);
CREATE INDEX idx_email_send_failures_created_at ON public.email_send_failures(created_at DESC);