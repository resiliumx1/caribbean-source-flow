GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_order_owner_or_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_consultation_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_wce_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_wce_order(uuid) TO anon, authenticated;