-- =======================================================
-- Sprinting.ink — Daily Prompt Feature Migration
-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/qugqybqvfhcoyotkuokb/sql/new
-- =======================================================

-- Daily Prompts table (one row per calendar day)
CREATE TABLE IF NOT EXISTS public.daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_date DATE UNIQUE NOT NULL,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_category TEXT NOT NULL DEFAULT 'general',
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Submissions table (one per user per day)
CREATE TABLE IF NOT EXISTS public.daily_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_prompt_id UUID NOT NULL REFERENCES public.daily_prompts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_username TEXT NOT NULL,
  is_pro_user BOOLEAN DEFAULT false,
  submitted BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  net_score INTEGER DEFAULT 0,
  upvoters UUID[] DEFAULT ARRAY[]::UUID[],
  downvoters UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_prompt_id, author_id)
);

-- Enable RLS
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Daily prompts are public" ON public.daily_prompts;
DROP POLICY IF EXISTS "Users can create daily prompt records" ON public.daily_prompts;
DROP POLICY IF EXISTS "Daily submissions are public" ON public.daily_submissions;
DROP POLICY IF EXISTS "Users can insert their own daily submissions" ON public.daily_submissions;
DROP POLICY IF EXISTS "Users can update their own daily submissions" ON public.daily_submissions;
DROP POLICY IF EXISTS "Users can update votes on daily submissions" ON public.daily_submissions;

-- daily_prompts policies
CREATE POLICY "Daily prompts are public"
  ON public.daily_prompts FOR SELECT USING (true);

-- Allow any authenticated user to create tomorrow's/today's daily_prompt row
-- (UNIQUE constraint ensures only one row per date; duplicates are silently ignored with ON CONFLICT)
CREATE POLICY "Users can create daily prompt records"
  ON public.daily_prompts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- daily_submissions policies
CREATE POLICY "Daily submissions are public"
  ON public.daily_submissions FOR SELECT USING (true);

CREATE POLICY "Users can insert their own daily submissions"
  ON public.daily_submissions FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own daily submissions"
  ON public.daily_submissions FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can update votes on daily submissions"
  ON public.daily_submissions FOR UPDATE USING (true);

-- Functions
CREATE OR REPLACE FUNCTION public.increment_participant_count(prompt_date_val DATE)
RETURNS void AS $$
BEGIN
  UPDATE public.daily_prompts
  SET participant_count = participant_count + 1
  WHERE prompt_date = prompt_date_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a profile column to track daily streak (if it doesn't already exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_date DATE;
