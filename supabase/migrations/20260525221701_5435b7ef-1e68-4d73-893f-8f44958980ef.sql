ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles SET is_admin = true WHERE email = 'admin123@mountkailashslu.com';
ALTER TABLE public.profiles ENABLE TRIGGER USER;