-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create their own friend messages" ON public.friend_messages;

-- Create a new policy that allows anyone to insert friend messages (for anonymous friends)
CREATE POLICY "Anyone can send friend messages"
ON public.friend_messages
FOR INSERT
WITH CHECK (true);

-- Note: SELECT and DELETE remain restricted to the recipient user