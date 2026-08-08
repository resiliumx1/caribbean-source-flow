ALTER TABLE public.wce_speakers
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS wce_speakers_slug_key ON public.wce_speakers (slug) WHERE slug IS NOT NULL;

UPDATE public.wce_speakers SET slug = 'kailash', og_image_url = '/og/speaker-kailash.jpg' WHERE name = 'Priest Kailash';
UPDATE public.wce_speakers SET slug = 'jah9', og_image_url = '/og/speaker-jah9.jpg' WHERE name = 'Jah9';
UPDATE public.wce_speakers SET slug = 'kamila-mcdonald', og_image_url = '/og/speaker-kamila-mcdonald.jpg' WHERE name = 'Kamila McDonald';
UPDATE public.wce_speakers SET slug = 'bobby-price', og_image_url = '/og/speaker-bobby-price.jpg' WHERE name = 'Dr. Bobby Price';
UPDATE public.wce_speakers SET slug = 'karlyn-percil', og_image_url = '/og/speaker-karlyn-percil.jpg' WHERE name = 'Karlyn Percil-Mercieca';
UPDATE public.wce_speakers SET slug = 'wayne-rose', og_image_url = '/og/speaker-wayne-rose.jpg' WHERE name = 'Wayne A. Rose';
UPDATE public.wce_speakers SET slug = 'rizza-islam', og_image_url = '/og/speaker-rizza-islam.jpg' WHERE name = 'Rizza Islam';