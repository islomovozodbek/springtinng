-- Add a dedicated column to securely track explicit user achievements without slowing down the app!
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS earned_achievements TEXT[] DEFAULT ARRAY[]::TEXT[];
