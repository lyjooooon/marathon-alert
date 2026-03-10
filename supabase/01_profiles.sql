-- ============================================================
-- RUN IN ONE: profiles 테이블
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- 1. profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  running_level TEXT CHECK (running_level IN ('beginner', 'intermediate', 'advanced')),
  pace_min_per_km INTEGER,   -- 평균 페이스 (초/km)
  weekly_mileage_km INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
CREATE POLICY "profiles_owner_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. 신규 가입 시 자동으로 profiles 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. race_participations 테이블 (대회 참가 기록)
CREATE TABLE IF NOT EXISTS public.race_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'completed', 'dnf', 'wishlist')) DEFAULT 'wishlist',
  finish_time TEXT,   -- "3:45:22" 형식
  bib_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

ALTER TABLE public.race_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participations_owner_all" ON public.race_participations;
CREATE POLICY "participations_owner_all" ON public.race_participations
  FOR ALL USING (auth.uid() = user_id);
