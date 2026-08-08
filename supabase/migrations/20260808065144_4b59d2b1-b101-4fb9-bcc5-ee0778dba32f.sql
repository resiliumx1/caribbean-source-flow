ALTER TABLE public.consultation_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.wholesale_leads REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.failed_order_alerts REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wholesale_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.failed_order_alerts;