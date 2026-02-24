
-- Create retreat_videos table
CREATE TABLE public.retreat_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'experience',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retreat_videos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view retreat videos"
  ON public.retreat_videos FOR SELECT
  USING (true);

-- Admin write
CREATE POLICY "Admins can insert retreat videos"
  ON public.retreat_videos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update retreat videos"
  ON public.retreat_videos FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete retreat videos"
  ON public.retreat_videos FOR DELETE
  USING (is_admin());
