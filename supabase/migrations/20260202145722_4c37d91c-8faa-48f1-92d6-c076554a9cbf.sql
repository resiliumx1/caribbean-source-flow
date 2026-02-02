-- Fix orders INSERT policy to prevent cross-user data injection
-- The policy must verify user_id matches auth.uid() or is NULL

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Authenticated users can create own orders" 
ON public.orders
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND (auth.uid() = user_id OR user_id IS NULL));

-- Also fix order_items INSERT policy to verify order ownership
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;

CREATE POLICY "Users can insert own order items" 
ON public.order_items
FOR INSERT 
WITH CHECK (is_order_owner_or_admin(order_id));