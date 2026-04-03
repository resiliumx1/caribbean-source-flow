-- Prevent privilege escalation: non-admins cannot change is_admin flag
CREATE OR REPLACE FUNCTION public.protect_admin_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If is_admin is being changed and the current user is not already an admin, block it
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_admin_flag_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_admin_flag();