-- =============================================
-- Mount Kailash E-Commerce Database Schema
-- Part 1: Base Tables
-- =============================================

-- =============================================
-- PROFILES TABLE (must be first for is_admin function)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country_code TEXT DEFAULT '+1',
  preferred_currency TEXT DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'XCD')),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- PRODUCT CATEGORIES
-- =============================================
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price_usd NUMERIC(10,2) NOT NULL,
  price_xcd NUMERIC(10,2) NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  product_type TEXT NOT NULL CHECK (product_type IN ('tincture', 'capsule', 'powder', 'tea', 'raw_herb', 'bundle', 'soap')),
  image_url TEXT,
  badge TEXT CHECK (badge IN ('wildcrafted', 'fermented', 'best_seller', 'new', NULL)),
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')),
  traditional_use TEXT,
  pharmaceutical_info TEXT,
  ingredients TEXT,
  dosage_instructions TEXT,
  contraindications TEXT,
  size_info TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- BUNDLE ITEMS (for bundle composition)
-- =============================================
CREATE TABLE public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

-- =============================================
-- DELIVERY ZONES (St. Lucia local delivery)
-- =============================================
CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  areas TEXT[] NOT NULL,
  fee_xcd NUMERIC(10,2) NOT NULL,
  fee_usd NUMERIC(10,2) NOT NULL,
  delivery_time TEXT,
  same_day_available BOOLEAN DEFAULT false,
  same_day_cutoff TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- SHIPPING RATES (International)
-- =============================================
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  countries TEXT[],
  base_rate_usd NUMERIC(10,2) NOT NULL,
  per_item_rate_usd NUMERIC(10,2) DEFAULT 0,
  estimated_days TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- CART ITEMS
-- =============================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  order_number TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('local', 'international')),
  delivery_zone_id UUID REFERENCES public.delivery_zones(id),
  shipping_rate_id UUID REFERENCES public.shipping_rates(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'LC',
  subtotal_usd NUMERIC(10,2) NOT NULL,
  subtotal_xcd NUMERIC(10,2) NOT NULL,
  shipping_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_xcd NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(10,2) NOT NULL,
  total_xcd NUMERIC(10,2) NOT NULL,
  currency_used TEXT NOT NULL CHECK (currency_used IN ('USD', 'XCD')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cod', 'bank_transfer', 'paypal')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_notes TEXT,
  admin_notes TEXT,
  whatsapp_notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_usd NUMERIC(10,2) NOT NULL,
  price_xcd NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- STORE SETTINGS
-- =============================================
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- HELPER FUNCTIONS (after tables exist)
-- =============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Check order ownership or admin
CREATE OR REPLACE FUNCTION public.is_order_owner_or_admin(target_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin() OR auth.uid() = (SELECT user_id FROM orders WHERE id = target_order_id);
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number := 'MK' || to_char(now(), 'YYYYMMDD') || '-' || 
    LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  RETURN NEW;
END;
$$;

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Product Categories
CREATE POLICY "Anyone can view categories" ON public.product_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.product_categories
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.product_categories
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.product_categories
  FOR DELETE USING (is_admin());

-- Products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (is_admin());

-- Bundle Items
CREATE POLICY "Anyone can view bundle items" ON public.bundle_items
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert bundle items" ON public.bundle_items
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update bundle items" ON public.bundle_items
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete bundle items" ON public.bundle_items
  FOR DELETE USING (is_admin());

-- Delivery Zones
CREATE POLICY "Anyone can view active zones" ON public.delivery_zones
  FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can insert zones" ON public.delivery_zones
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update zones" ON public.delivery_zones
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete zones" ON public.delivery_zones
  FOR DELETE USING (is_admin());

-- Shipping Rates
CREATE POLICY "Anyone can view active rates" ON public.shipping_rates
  FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can insert rates" ON public.shipping_rates
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update rates" ON public.shipping_rates
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete rates" ON public.shipping_rates
  FOR DELETE USING (is_admin());

-- Cart Items
CREATE POLICY "Users can view own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from cart" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Order Items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (is_admin() OR is_order_owner_or_admin(order_id));
CREATE POLICY "Authenticated users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Store Settings
CREATE POLICY "Anyone can view settings" ON public.store_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.store_settings
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update settings" ON public.store_settings
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete settings" ON public.store_settings
  FOR DELETE USING (is_admin());

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Categories
INSERT INTO public.product_categories (name, slug, description, display_order) VALUES
  ('Liquid Tinctures', 'liquid-tinctures', 'Naturally fermented liquid herbal formulations in amber glass bottles', 1),
  ('Capsules & Powders', 'capsules-powders', 'Concentrated herbal powders and vegetable capsules', 2),
  ('Traditional Teas', 'traditional-teas', 'Hand-blended herbal tea formulations', 3),
  ('Curated Bundles', 'curated-bundles', 'Value packages combining complementary formulations', 4),
  ('Raw Herbs', 'raw-herbs', 'Wildcrafted single herbs for practitioners', 5);

-- Delivery Zones
INSERT INTO public.delivery_zones (name, areas, fee_xcd, fee_usd, delivery_time, same_day_available, same_day_cutoff) VALUES
  ('North', ARRAY['Castries', 'Gros Islet', 'Rodney Bay', 'Cap Estate', 'Babonneau'], 15.00, 5.50, 'Same day or next day', true, '14:00'),
  ('Central', ARRAY['Dennery', 'Micoud', 'Praslin', 'Mon Repos'], 20.00, 7.50, '1-2 business days', false, NULL),
  ('South', ARRAY['Soufrière', 'Choiseul', 'Laborie', 'Vieux Fort'], 25.00, 9.50, '1-2 business days', false, NULL);

-- Shipping Rates
INSERT INTO public.shipping_rates (region, countries, base_rate_usd, per_item_rate_usd, estimated_days) VALUES
  ('Caribbean', ARRAY['BB', 'TT', 'GD', 'VC', 'DM', 'AG', 'KN', 'JM'], 15.00, 2.00, '3-5 business days'),
  ('United States', ARRAY['US'], 25.00, 3.00, '5-7 business days'),
  ('United Kingdom', ARRAY['GB'], 30.00, 3.50, '7-10 business days'),
  ('Canada', ARRAY['CA'], 28.00, 3.00, '5-7 business days'),
  ('Europe', ARRAY['DE', 'FR', 'NL', 'BE', 'ES', 'IT'], 35.00, 4.00, '7-12 business days'),
  ('Rest of World', ARRAY[]::TEXT[], 45.00, 5.00, '10-15 business days');

-- Store Settings
INSERT INTO public.store_settings (key, value) VALUES
  ('currency_rate', '{"usd_to_xcd": 2.70}'::jsonb),
  ('whatsapp', '{"number": "+17582855195", "sales_manager": "Goddess Itopia Archer"}'::jsonb),
  ('store_info', '{"email": "goddessitopia@mountkailashslu.com", "phone": "+17582855195"}'::jsonb);