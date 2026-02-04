-- Fix overly permissive RLS policies on concierge_conversations
-- The current policies allow viewing any conversation where user_id IS NULL
-- This is a security risk as anyone could potentially access anonymous conversations

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.concierge_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.concierge_conversations;
DROP POLICY IF EXISTS "Users can create conversations with valid session" ON public.concierge_conversations;

-- Create stricter SELECT policy:
-- Authenticated users can only view their own conversations (user_id = auth.uid())
-- Admins can view all conversations for support purposes
CREATE POLICY "Users can view own conversations" 
ON public.concierge_conversations 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR is_admin()
);

-- Create stricter UPDATE policy:
-- Only the conversation owner can update, or admins
CREATE POLICY "Users can update own conversations" 
ON public.concierge_conversations 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR is_admin()
);

-- Create INSERT policy:
-- Allow service role (edge functions) to insert via SUPABASE_SERVICE_ROLE_KEY
-- For client inserts, require valid session_id format
-- The edge function uses service role key, so client-side RLS won't block it
CREATE POLICY "Service can create conversations" 
ON public.concierge_conversations 
FOR INSERT 
WITH CHECK (
  -- Allow inserts with valid session format (edge function handles validation)
  session_id IS NOT NULL 
  AND length(session_id) >= 10
  AND length(session_id) <= 100
);