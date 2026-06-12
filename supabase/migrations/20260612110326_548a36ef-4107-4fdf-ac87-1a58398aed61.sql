CREATE POLICY "Service role can insert failed order alerts"
ON public.failed_order_alerts FOR INSERT TO service_role WITH CHECK (true);
GRANT INSERT ON public.failed_order_alerts TO service_role;