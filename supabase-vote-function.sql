-- ── Persistent Voting for Feed Stories ──────────────────────────────────────
-- Run this in the Supabase SQL editor.
-- This function runs as SECURITY DEFINER so any authenticated user can update
-- the upvoters/downvoters arrays and related scores, even though the stories
-- table's UPDATE RLS policy only allows the story's own author.

CREATE OR REPLACE FUNCTION public.vote_story(
  p_story_id    UUID,
  p_user_id     UUID,
  p_direction   TEXT   -- 'up' | 'down' | 'none'  ('none' = undo)
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
  -- Only allow authenticated callers
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch the current story row
  SELECT * INTO v_story FROM stories WHERE id = p_story_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Story not found';
  END IF;

  -- Start with existing arrays (default to empty)
  v_new_upvoters   := COALESCE(v_story.upvoters, ARRAY[]::UUID[]);
  v_new_downvoters := COALESCE(v_story.downvoters, ARRAY[]::UUID[]);

  -- Determine old contribution to score delta (for profile update)
  IF p_user_id = ANY(v_new_upvoters) THEN
    v_score_delta := v_score_delta - 1;  -- removing old upvote
  END IF;
  IF p_user_id = ANY(v_new_downvoters) THEN
    v_score_delta := v_score_delta + 1;  -- removing old downvote
  END IF;

  -- Remove this user from both arrays first (clean slate)
  v_new_upvoters   := array_remove(v_new_upvoters,   p_user_id);
  v_new_downvoters := array_remove(v_new_downvoters, p_user_id);

  -- Apply new direction
  IF p_direction = 'up' THEN
    v_new_upvoters  := array_append(v_new_upvoters, p_user_id);
    v_score_delta   := v_score_delta + 1;
  ELSIF p_direction = 'down' THEN
    v_new_downvoters := array_append(v_new_downvoters, p_user_id);
    v_score_delta    := v_score_delta - 1;
  END IF;
  -- 'none' = undo, already removed above, no further action.

  v_new_net_score := array_length(COALESCE(v_new_upvoters,   ARRAY[]::UUID[]), 1) -
                     array_length(COALESCE(v_new_downvoters, ARRAY[]::UUID[]), 1);

  -- Coerce nulls from array_length (empty arrays return NULL)
  IF v_new_net_score IS NULL THEN
    v_new_net_score := COALESCE(
      array_length(v_new_upvoters,   1), 0) -
      COALESCE(array_length(v_new_downvoters, 1), 0);
  END IF;

  -- Update the story row
  UPDATE stories
  SET upvoters   = v_new_upvoters,
      downvoters = v_new_downvoters,
      net_score  = v_new_net_score
  WHERE id = p_story_id;

  -- Update the author's profile totals (only if there's an actual score change)
  IF v_score_delta <> 0 AND v_story.author_id IS NOT NULL THEN
    UPDATE profiles
    SET total_upvotes_received = GREATEST(0, total_upvotes_received + v_score_delta),
        net_score              = GREATEST(0, net_score + v_score_delta)
    WHERE id = v_story.author_id;
  END IF;

  v_result := json_build_object(
    'upvoters',   v_new_upvoters,
    'downvoters', v_new_downvoters,
    'net_score',  v_new_net_score
  );

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.vote_story(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vote_story(UUID, UUID, TEXT) TO authenticated;
