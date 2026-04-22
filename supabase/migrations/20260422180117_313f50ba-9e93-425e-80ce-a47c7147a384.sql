
-- Restrict friend_messages INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can send friend messages" ON public.friend_messages;
CREATE POLICY "Authenticated users can send friend messages"
ON public.friend_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Remove user-controlled write policies on subscriptions to prevent privilege escalation.
-- Subscription writes must be performed server-side (service_role/webhook).
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
