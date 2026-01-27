-- Add optional email field to friend_messages for thank-you notifications
ALTER TABLE public.friend_messages 
ADD COLUMN friend_email text;