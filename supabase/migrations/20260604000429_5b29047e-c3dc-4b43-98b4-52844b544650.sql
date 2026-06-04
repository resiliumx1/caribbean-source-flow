CREATE POLICY "Admins can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'review-images' AND public.is_admin())
WITH CHECK (bucket_id = 'review-images' AND public.is_admin());

CREATE POLICY "Admins can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'review-images' AND public.is_admin());