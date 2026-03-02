
-- Create webinar_videos table
CREATE TABLE public.webinar_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_video_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webinar_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view webinar videos"
ON public.webinar_videos
FOR SELECT
USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert webinar videos"
ON public.webinar_videos
FOR INSERT
WITH CHECK (is_admin());

-- Admins can update
CREATE POLICY "Admins can update webinar videos"
ON public.webinar_videos
FOR UPDATE
USING (is_admin());

-- Admins can delete
CREATE POLICY "Admins can delete webinar videos"
ON public.webinar_videos
FOR DELETE
USING (is_admin());
