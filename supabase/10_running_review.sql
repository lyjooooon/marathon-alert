-- ============================================================
-- Running Review App — DB Schema
-- ============================================================

-- 1. 제품 (러닝화 중심)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'shoes',  -- shoes | apparel | watch | accessory
  description TEXT,
  images TEXT[] DEFAULT '{}',
  release_year INT,
  price_krw INT,
  -- 러닝화 전용 스펙
  weight_g INT,
  drop_mm INT,
  stack_height_mm INT,
  cushion_type TEXT,   -- max | moderate | minimal | racing
  surface TEXT,        -- road | trail | track | mixed
  -- 집계 (트리거로 자동 갱신)
  avg_rating NUMERIC(3,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  collection_count INT DEFAULT 0,
  -- 관리
  is_published BOOLEAN DEFAULT false,
  suggested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 리뷰 (유저 1인 1제품 1리뷰)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  title TEXT,
  content TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 3. 리뷰 좋아요
CREATE TABLE IF NOT EXISTS review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- 4. 유저 컬렉션
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('using', 'used', 'wishlist')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 5. 유저 제품 제안
CREATE TABLE IF NOT EXISTS product_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'shoes',
  note TEXT,
  reference_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS 정책
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suggestions ENABLE ROW LEVEL SECURITY;

-- products: 발행된 것은 누구나 조회, 수정은 서비스롤만
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT USING (is_published = true);

-- reviews: 누구나 조회, 본인만 수정/삭제
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- review_likes: 누구나 조회, 본인만 추가/삭제
DROP POLICY IF EXISTS "review_likes_select" ON review_likes;
CREATE POLICY "review_likes_select" ON review_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "review_likes_insert" ON review_likes;
CREATE POLICY "review_likes_insert" ON review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "review_likes_delete" ON review_likes;
CREATE POLICY "review_likes_delete" ON review_likes FOR DELETE USING (auth.uid() = user_id);

-- user_collections: 본인 것만 조회/수정/삭제
DROP POLICY IF EXISTS "user_collections_select" ON user_collections;
CREATE POLICY "user_collections_select" ON user_collections FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_collections_insert" ON user_collections;
CREATE POLICY "user_collections_insert" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_collections_update" ON user_collections;
CREATE POLICY "user_collections_update" ON user_collections FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_collections_delete" ON user_collections;
CREATE POLICY "user_collections_delete" ON user_collections FOR DELETE USING (auth.uid() = user_id);

-- product_suggestions: 본인 것 조회, 등록 가능
DROP POLICY IF EXISTS "product_suggestions_select" ON product_suggestions;
CREATE POLICY "product_suggestions_select" ON product_suggestions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "product_suggestions_insert" ON product_suggestions;
CREATE POLICY "product_suggestions_insert" ON product_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 트리거 함수
-- ============================================================

-- reviews → products avg_rating, review_count 자동 갱신
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    avg_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_stats();

-- review_likes → reviews like_count 자동 갱신
CREATE OR REPLACE FUNCTION update_review_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET like_count = (
    SELECT COUNT(*) FROM review_likes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_like_change ON review_likes;
CREATE TRIGGER on_review_like_change
  AFTER INSERT OR DELETE ON review_likes
  FOR EACH ROW EXECUTE FUNCTION update_review_like_count();

-- user_collections → products collection_count 자동 갱신
CREATE OR REPLACE FUNCTION update_product_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET collection_count = (
    SELECT COUNT(*) FROM user_collections
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_collection_change ON user_collections;
CREATE TRIGGER on_collection_change
  AFTER INSERT OR UPDATE OR DELETE ON user_collections
  FOR EACH ROW EXECUTE FUNCTION update_product_collection_count();

-- reviews updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_update ON reviews;
CREATE TRIGGER on_review_update
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();
