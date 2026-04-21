-- ============================================================
-- sprinting.ink — Settings persistence migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add email_notifications preference column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- 2. Secure RPC for self-deletion
--    SECURITY DEFINER runs as the postgres superuser so it can
--    DELETE from auth.users. Profiles + stories cascade automatically
--    via their ON DELETE CASCADE foreign keys.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Lock it down so only logged-in users can call it
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
