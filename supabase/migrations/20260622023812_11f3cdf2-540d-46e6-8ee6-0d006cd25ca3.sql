
-- 1) Products: add optional expiration date
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 2) Retreat types: add image fields
ALTER TABLE public.retreat_types
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS additional_images text[] NOT NULL DEFAULT '{}'::text[];

-- 3) Caribbean Wellness Event — shop products (GA + VIP)
INSERT INTO public.products
  (name, slug, short_description, description, price_usd, price_xcd, product_type, image_url, stock_status, is_active, is_featured, expires_at, is_digital)
VALUES
  (
    'Caribbean Wellness Saint Lucia 2026 — GA Ticket',
    'caribbean-wellness-2026-ga',
    'General Admission · Self-Love Experience · 10:00 AM – 7:00 PM · Sun Oct 11, 2026.',
    '<p><strong>Caribbean Wellness Saint Lucia 2026</strong> — a holistic health & wellness symposium hosted by Rt. Hon. Priest Kailash.</p><p><strong>Self-Love Experience</strong>: 10:00 AM – 7:00 PM on Sunday, October 11, 2026. Includes admission to the public gathering, talks from visionary leaders, and the closing ceremony.</p><p>Spaces are limited. Reserve yours today.</p>',
    70, 189, 'other',
    '/__l5e/assets-v1/9d528269-04aa-4246-808f-3e91c6b80f70/caribbean-wellness-2026.png',
    'in_stock', true, true,
    '2026-10-11 23:59:59+00',
    true
  ),
  (
    'Caribbean Wellness Saint Lucia 2026 — VIP Full Immersive',
    'caribbean-wellness-2026-vip',
    'VIP Full Immersive Experience · 5:30 AM – 7:00 PM · Sun Oct 11, 2026.',
    '<p><strong>Caribbean Wellness Saint Lucia 2026</strong> — a holistic health & wellness symposium hosted by Rt. Hon. Priest Kailash.</p><p><strong>Full Immersive Experience</strong>: 5:30 AM – 7:00 PM on Sunday, October 11, 2026. Includes both segments, VIP seating, talks from visionary leaders, and the closing graduation ceremony of The Mount Kailash Herbal School of Esoteric Knowledge.</p><p>Spaces are limited. Reserve yours today.</p>',
    180, 486, 'other',
    '/__l5e/assets-v1/9d528269-04aa-4246-808f-3e91c6b80f70/caribbean-wellness-2026.png',
    'in_stock', true, true,
    '2026-10-11 23:59:59+00',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 4) Caribbean Wellness Event — retreat type + date
INSERT INTO public.retreat_types
  (slug, name, type, min_nights, max_nights, base_price_usd, price_type, max_capacity, description, includes, is_active, image_url)
VALUES
  (
    'caribbean-wellness-2026',
    'Caribbean Wellness Saint Lucia 2026',
    'group', 1, 1, 70, 'per_person', 200,
    'A holistic health & wellness symposium hosted by Rt. Hon. Priest Kailash. A day of renewal, wisdom, and community — REJUVENATE. EMPOWER. TRANSFORM. Choose General Admission ($70 USD) or the Full Immersive VIP Experience ($180 USD).',
    '["Keynote with Rt. Hon. Priest Kailash","Visionary leader talks","Physical & Spiritual Alignment","Integrative Health Education","Legacy & Professional Growth","Closing ceremony"]'::jsonb,
    true,
    '/__l5e/assets-v1/9d528269-04aa-4246-808f-3e91c6b80f70/caribbean-wellness-2026.png'
  )
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url
RETURNING id;

INSERT INTO public.retreat_dates
  (retreat_type_id, start_date, end_date, spots_total, spots_booked, price_override_usd, is_published, promo_label, description)
SELECT
  rt.id, DATE '2026-10-11', DATE '2026-10-12', 200, 0, 70, true,
  'Public Event',
  'Sun Oct 11, 2026 — public gathering. GA $70 / VIP $180 USD.'
FROM public.retreat_types rt
WHERE rt.slug = 'caribbean-wellness-2026'
  AND NOT EXISTS (
    SELECT 1 FROM public.retreat_dates d
    WHERE d.retreat_type_id = rt.id AND d.start_date = DATE '2026-10-11'
  );
