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
  xp INTEGER DEFAULT 0,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories policies
CREATE POLICY "Published stories are viewable by everyone"
  ON public.stories FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stories"
  ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own stories"
  ON public.stories FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE USING (auth.uid() = author_id);

-- Function to handle new user signup
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

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
