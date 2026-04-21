-- sprinting.ink — Final Consolidated Supabase Schema
-- This file contains the complete, idempotent schema for the project, superseding all individual migrations.
-- Safe to run multiple times (using IF NOT EXISTS / OR REPLACE / DROP IF EXISTS guards).

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT DEFAULT '',
  photo_url TEXT,
  tier TEXT DEFAULT 'basic',
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  total_upvotes_received INTEGER DEFAULT 0,
  sprints_today INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  aura INTEGER DEFAULT 0, -- renamed from xp
  level INTEGER DEFAULT 1,
  is_og BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  referral_code TEXT,
  referral_count INTEGER DEFAULT 0,
  unlocked_themes TEXT[] DEFAULT ARRAY['default'],
  unlocked_accessories TEXT[] DEFAULT ARRAY[]::TEXT[],
  active_theme TEXT DEFAULT 'default',
  active_accessories TEXT[] DEFAULT ARRAY[]::TEXT[],
  profile_color TEXT DEFAULT 'derby',
  net_score INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_daily_date DATE,
  email_notifications BOOLEAN DEFAULT true,
  earned_achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns are consistent for existing databases (idempotent patches)
DO $$
BEGIN
    -- Rename xp to aura if it still exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE public.profiles RENAME COLUMN xp TO aura;
    END IF;

    -- Add missing columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'aura') THEN
        ALTER TABLE public.profiles ADD COLUMN aura INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'daily_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN daily_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_daily_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_daily_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email_notifications') THEN
        ALTER TABLE public.profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'earned_achievements') THEN
        ALTER TABLE public.profiles ADD COLUMN earned_achievements TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'net_score') THEN
        ALTER TABLE public.profiles ADD COLUMN net_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_username TEXT NOT NULL,
  is_pro_user BOOLEAN DEFAULT false,
  title TEXT DEFAULT 'Untitled Sprint',
  content TEXT NOT NULL,
  starter_sentence TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  time_mode INTEGER DEFAULT 3,
  net_score INTEGER DEFAULT 0,
  upvoters UUID[] DEFAULT ARRAY[]::UUID[],
  downvoters UUID[] DEFAULT ARRAY[]::UUID[],
  is_hidden BOOLEAN DEFAULT false,
  chain_part INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Daily Prompts table
CREATE TABLE IF NOT EXISTS public.daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_date DATE UNIQUE NOT NULL,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_category TEXT NOT NULL DEFAULT 'general',
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Submissions table
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

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_submissions ENABLE ROW LEVEL SECURITY;

-- 4. FUNCTIONS & RPCs

-- Handle new user signup (triggered from auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, photo_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', 'User'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Follow system counters
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_unfollow()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily prompt utility
CREATE OR REPLACE FUNCTION public.increment_participant_count(prompt_date_val DATE)
RETURNS void AS $$
BEGIN
  UPDATE public.daily_prompts
  SET participant_count = participant_count + 1
  WHERE prompt_date = prompt_date_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Account management (SECURE DEFINER to allow deletion from auth.users)
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

-- Feed story voting system
CREATE OR REPLACE FUNCTION public.vote_story(
  p_story_id    UUID,
  p_user_id     UUID,
  p_direction   TEXT   -- 'up' | 'down' | 'none'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_story         stories%ROWTYPE;
  v_new_upvoters  UUID[];
  v_new_downvoters UUID[];
  v_new_net_score  INTEGER;
  v_score_delta   INTEGER := 0;
  v_result        JSON;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  
  SELECT * INTO v_story FROM stories WHERE id = p_story_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Story not found'; END IF;

  v_new_upvoters   := COALESCE(v_story.upvoters, ARRAY[]::UUID[]);
  v_new_downvoters := COALESCE(v_story.downvoters, ARRAY[]::UUID[]);

  IF p_user_id = ANY(v_new_upvoters) THEN v_score_delta := v_score_delta - 1; END IF;
  IF p_user_id = ANY(v_new_downvoters) THEN v_score_delta := v_score_delta + 1; END IF;

  v_new_upvoters   := array_remove(v_new_upvoters,   p_user_id);
  v_new_downvoters := array_remove(v_new_downvoters, p_user_id);

  IF p_direction = 'up' THEN
    v_new_upvoters  := array_append(v_new_upvoters, p_user_id);
    v_score_delta   := v_score_delta + 1;
  ELSIF p_direction = 'down' THEN
    v_new_downvoters := array_append(v_new_downvoters, p_user_id);
    v_score_delta    := v_score_delta - 1;
  END IF;

  v_new_net_score := COALESCE(array_length(v_new_upvoters, 1), 0) - COALESCE(array_length(v_new_downvoters, 1), 0);

  UPDATE stories
  SET upvoters = v_new_upvoters, downvoters = v_new_downvoters, net_score = v_new_net_score
  WHERE id = p_story_id;

  IF v_score_delta <> 0 AND v_story.author_id IS NOT NULL THEN
    UPDATE profiles
    SET total_upvotes_received = GREATEST(0, total_upvotes_received + v_score_delta),
        net_score = GREATEST(0, net_score + v_score_delta)
    WHERE id = v_story.author_id;
  END IF;

  RETURN json_build_object('upvoters', v_new_upvoters, 'downvoters', v_new_downvoters, 'net_score', v_new_net_score);
END;
$$;

-- 5. TRIGGERS

-- Handle auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle follow/unfollow counts
DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

DROP TRIGGER IF EXISTS on_follow_deleted ON public.follows;
CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_unfollow();

-- 6. RLS POLICIES

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories policies
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON public.stories;
CREATE POLICY "Published stories are viewable by everyone" ON public.stories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;
CREATE POLICY "Users can insert their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
CREATE POLICY "Users can update their own stories" ON public.stories FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = author_id);

-- Follows policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own follows" ON public.follows;
CREATE POLICY "Users can insert their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Daily Prompts policies
DROP POLICY IF EXISTS "Daily prompts are public" ON public.daily_prompts;
CREATE POLICY "Daily prompts are public" ON public.daily_prompts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create daily prompt records" ON public.daily_prompts;
CREATE POLICY "Users can create daily prompt records" ON public.daily_prompts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Daily Submissions policies
DROP POLICY IF EXISTS "Daily submissions are public" ON public.daily_submissions;
CREATE POLICY "Daily submissions are public" ON public.daily_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own daily submissions" ON public.daily_submissions;
CREATE POLICY "Users can insert their own daily submissions" ON public.daily_submissions FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update their own daily submissions" ON public.daily_submissions;
CREATE POLICY "Users can update their own daily submissions" ON public.daily_submissions FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update votes on daily submissions" ON public.daily_submissions;
CREATE POLICY "Users can update votes on daily submissions" ON public.daily_submissions FOR UPDATE USING (true);

-- 7. GRANTS
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

REVOKE ALL ON FUNCTION public.vote_story(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vote_story(UUID, UUID, TEXT) TO authenticated;
