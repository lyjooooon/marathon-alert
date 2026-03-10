-- =============================================
-- 정보 허브 유저 포스트 테이블
-- =============================================

-- info_posts
CREATE TABLE IF NOT EXISTS public.info_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('훈련팁', '코스추천', '장비리뷰', '대회후기')),
  like_count   INT NOT NULL DEFAULT 0,
  is_best      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- info_post_likes
CREATE TABLE IF NOT EXISTS public.info_post_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.info_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- like_count 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_info_post_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.info_posts
    SET like_count = like_count + 1,
        is_best = (like_count + 1 >= 3)
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.info_posts
    SET like_count = GREATEST(like_count - 1, 0),
        is_best = (GREATEST(like_count - 1, 0) >= 3)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_info_post_like_count ON public.info_post_likes;
CREATE TRIGGER trg_info_post_like_count
AFTER INSERT OR DELETE ON public.info_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_info_post_like_count();

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.set_info_post_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_info_post_updated_at ON public.info_posts;
CREATE TRIGGER trg_info_post_updated_at
BEFORE UPDATE ON public.info_posts
FOR EACH ROW EXECUTE FUNCTION public.set_info_post_updated_at();

-- RLS
ALTER TABLE public.info_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "info_posts_public_read" ON public.info_posts;
CREATE POLICY "info_posts_public_read" ON public.info_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "info_posts_owner_insert" ON public.info_posts;
CREATE POLICY "info_posts_owner_insert" ON public.info_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "info_posts_owner_update" ON public.info_posts;
CREATE POLICY "info_posts_owner_update" ON public.info_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "info_posts_owner_delete" ON public.info_posts;
CREATE POLICY "info_posts_owner_delete" ON public.info_posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "info_post_likes_public_read" ON public.info_post_likes;
CREATE POLICY "info_post_likes_public_read" ON public.info_post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "info_post_likes_owner_insert" ON public.info_post_likes;
CREATE POLICY "info_post_likes_owner_insert" ON public.info_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "info_post_likes_owner_delete" ON public.info_post_likes;
CREATE POLICY "info_post_likes_owner_delete" ON public.info_post_likes FOR DELETE USING (auth.uid() = user_id);
