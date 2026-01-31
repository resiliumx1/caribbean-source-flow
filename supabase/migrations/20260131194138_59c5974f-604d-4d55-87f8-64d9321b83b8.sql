-- Fix the permissive INSERT policy on concierge_conversations
-- Allow anonymous sessions OR authenticated users only
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.concierge_conversations;

CREATE POLICY "Users can create conversations with valid session"
  ON public.concierge_conversations FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL 
    AND length(session_id) >= 10
  );