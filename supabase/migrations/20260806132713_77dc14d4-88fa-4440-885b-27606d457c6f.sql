CREATE OR REPLACE FUNCTION public.is_wce_order(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN wce_pathways wp ON wp.product_id = oi.product_id
    WHERE oi.order_id = _order_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_wce_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_wce_order(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "orders wce admin select wce only" ON public.orders;
DROP POLICY IF EXISTS "order_items wce admin select wce only" ON public.order_items;

CREATE POLICY "orders wce admin select wce only"
ON public.orders FOR SELECT TO authenticated
USING (public.has_wce_access(auth.uid()) AND public.is_wce_order(id));

CREATE POLICY "order_items wce admin select wce only"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_wce_access(auth.uid()) AND public.is_wce_order(order_id));