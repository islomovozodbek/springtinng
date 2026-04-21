-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can insert their own follows"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Trigger functions to increment/decrement counters on profiles
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS trigger AS $$
BEGIN
  -- Increment following_count for the follower
  UPDATE public.profiles
  SET following_count = following_count + 1
  WHERE id = NEW.follower_id;
  
  -- Increment followers_count for the followed user
  UPDATE public.profiles
  SET followers_count = followers_count + 1
  WHERE id = NEW.following_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_unfollow()
RETURNS trigger AS $$
BEGIN
  -- Decrement following_count for the follower
  UPDATE public.profiles
  SET following_count = following_count - 1
  WHERE id = OLD.follower_id;
  
  -- Decrement followers_count for the followed user
  UPDATE public.profiles
  SET followers_count = followers_count - 1
  WHERE id = OLD.following_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

DROP TRIGGER IF EXISTS on_follow_deleted ON public.follows;
CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_unfollow();
