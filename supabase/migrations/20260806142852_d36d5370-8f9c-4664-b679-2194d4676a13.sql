DELETE FROM public.user_roles
 WHERE role = 'wce_admin'
   AND user_id IN (
     SELECT id FROM auth.users
      WHERE lower(email) IN ('wce-organiser-test-8601@mailinator.com','wcecj74voie@web-library.net')
   );

DELETE FROM public.wce_organiser_invites
 WHERE lower(email) IN ('wce-organiser-test-8601@mailinator.com','wcecj74voie@web-library.net');