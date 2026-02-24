-- Add promo_label to retreat_dates
ALTER TABLE public.retreat_dates ADD COLUMN promo_label TEXT;

-- Add custom_category_label to retreat_gallery
ALTER TABLE public.retreat_gallery ADD COLUMN custom_category_label TEXT;

-- Insert 10 monthly group retreat dates for 2026 (March-December)
INSERT INTO public.retreat_dates (retreat_type_id, start_date, end_date, spots_total, spots_booked, is_published, promo_label) VALUES
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-03-14', '2026-03-21', 10, 0, true, 'Early Bird'),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-04-11', '2026-04-18', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-05-09', '2026-05-16', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-06-13', '2026-06-20', 10, 0, true, 'New'),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-07-11', '2026-07-18', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-08-08', '2026-08-15', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-09-12', '2026-09-19', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-10-10', '2026-10-17', 10, 0, true, 'Last Chance'),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-11-14', '2026-11-21', 10, 0, true, NULL),
  ('297111e1-69fb-46e6-a03c-d5836b128359', '2026-12-12', '2026-12-19', 10, 0, true, NULL);