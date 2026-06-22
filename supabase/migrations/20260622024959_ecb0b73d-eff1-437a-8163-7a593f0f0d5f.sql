
-- Main Conference Livestream — shop product
INSERT INTO public.products
  (name, slug, short_description, description, price_usd, price_xcd, product_type, image_url, stock_status, is_active, is_featured, expires_at, is_digital)
VALUES
  (
    'Main Conference Livestream — Caribbean Wellness 2026',
    'caribbean-wellness-2026-livestream',
    'Online access · Sun Oct 11, 2026. Watch the Main Conference Livestream from anywhere.',
    '<p><strong>Main Conference Livestream</strong> — secure online access to the Caribbean Wellness Saint Lucia 2026 main conference on Sunday, October 11, 2026.</p><p>Tune in from anywhere in the world. Includes the full broadcast: keynote from Rt. Hon. Priest Kailash, visionary leader talks, and the closing ceremony.</p>',
    50, 135, 'other',
    '/__l5e/assets-v1/e4a62496-f6f5-49ff-ad1e-be3ce47ce0d9/main-conference-livestream.jpg',
    'in_stock', true, true,
    '2026-10-11 23:59:59+00',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Fortification Retreat — shop product (application/deposit)
INSERT INTO public.products
  (name, slug, short_description, description, price_usd, price_xcd, product_type, image_url, stock_status, is_active, is_featured, expires_at, is_digital)
VALUES
  (
    'Fortification Retreat — Caribbean Wellness 2026',
    'caribbean-wellness-2026-fortification',
    'Oct 12–17, 2026 · Application only · From $4,500 USD (accommodation tiered).',
    '<p><strong>Fortification Retreat</strong> — an exclusive 6-day immersive wellness retreat in the mineral rich soil of Saint Lucia''s mountains, hosted by Rt. Hon. Priest Kailash.</p><p><strong>Dates:</strong> October 12–17, 2026.</p><p><strong>Investment:</strong> $4,500–$5,500 USD depending on accommodation tier.</p><p><strong>Application only.</strong> Limited spaces. Begin your application to be considered for this transformative experience.</p>',
    4500, 12150, 'other',
    '/__l5e/assets-v1/7f8e6fdf-8e60-46dc-9b38-f342ad7115e0/fortification-retreat.jpg',
    'in_stock', true, true,
    '2026-10-17 23:59:59+00',
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Fortification Retreat — retreat type + scheduled date
INSERT INTO public.retreat_types
  (slug, name, type, min_nights, max_nights, base_price_usd, price_type, max_capacity, description, includes, is_active, image_url)
VALUES
  (
    'fortification-retreat-2026',
    'Fortification Retreat 2026',
    'group', 5, 5, 4500, 'per_person', 20,
    'An exclusive 6-day immersive wellness retreat (Oct 12–17, 2026) hosted by Rt. Hon. Priest Kailash in the mineral rich soil of Saint Lucia''s mountains. Application only. Accommodation tiers from $4,500 to $5,500 USD.',
    '["Daily teachings with Rt. Hon. Priest Kailash","Botanical feasts","Herbal protocols & fortification","Sacred ceremony","Mountain immersion","Accommodation (tiered)"]'::jsonb,
    true,
    '/__l5e/assets-v1/7f8e6fdf-8e60-46dc-9b38-f342ad7115e0/fortification-retreat.jpg'
  )
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

INSERT INTO public.retreat_dates
  (retreat_type_id, start_date, end_date, spots_total, spots_booked, price_override_usd, is_published, promo_label, description)
SELECT
  rt.id, DATE '2026-10-12', DATE '2026-10-17', 20, 0, 4500, true,
  'Application Only',
  'Oct 12–17, 2026 — Fortification Retreat. $4,500–$5,500 USD depending on accommodation.'
FROM public.retreat_types rt
WHERE rt.slug = 'fortification-retreat-2026'
  AND NOT EXISTS (
    SELECT 1 FROM public.retreat_dates d
    WHERE d.retreat_type_id = rt.id AND d.start_date = DATE '2026-10-12'
  );

-- Main Conference Livestream — retreat type (online/livestream)
INSERT INTO public.retreat_types
  (slug, name, type, min_nights, max_nights, base_price_usd, price_type, max_capacity, description, includes, is_active, image_url)
VALUES
  (
    'caribbean-wellness-2026-livestream',
    'Main Conference Livestream 2026',
    'group', 1, 1, 50, 'per_person', 5000,
    'Online livestream access to the Caribbean Wellness Saint Lucia 2026 main conference on Sun Oct 11, 2026. Watch from anywhere.',
    '["Full conference broadcast","Keynote with Rt. Hon. Priest Kailash","Visionary leader talks","Closing ceremony"]'::jsonb,
    true,
    '/__l5e/assets-v1/e4a62496-f6f5-49ff-ad1e-be3ce47ce0d9/main-conference-livestream.jpg'
  )
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

INSERT INTO public.retreat_dates
  (retreat_type_id, start_date, end_date, spots_total, spots_booked, price_override_usd, is_published, promo_label, description)
SELECT
  rt.id, DATE '2026-10-11', DATE '2026-10-12', 5000, 0, 50, true,
  'Livestream',
  'Sun Oct 11, 2026 — online access. $50 USD.'
FROM public.retreat_types rt
WHERE rt.slug = 'caribbean-wellness-2026-livestream'
  AND NOT EXISTS (
    SELECT 1 FROM public.retreat_dates d
    WHERE d.retreat_type_id = rt.id AND d.start_date = DATE '2026-10-11'
  );
