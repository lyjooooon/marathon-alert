-- ============================================================
-- RUN IN ONE: 정보 허브 테이블
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- 1. 트레이닝 플랜
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_distance TEXT CHECK (target_distance IN ('5k', '10k', 'half', 'full')),
  target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER NOT NULL,
  description TEXT,
  weekly_structure JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "training_plans_public_read" ON public.training_plans;
CREATE POLICY "training_plans_public_read" ON public.training_plans FOR SELECT USING (true);

-- 2. 유저 플랜 수강 현황
CREATE TABLE IF NOT EXISTS public.user_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_training_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_plans_owner_all" ON public.user_training_plans;
CREATE POLICY "user_plans_owner_all" ON public.user_training_plans FOR ALL USING (auth.uid() = user_id);

-- 3. 전문가 칼럼
CREATE TABLE IF NOT EXISTS public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "columns_public_read" ON public.columns;
CREATE POLICY "columns_public_read" ON public.columns FOR SELECT USING (published = true);

-- 4. 코스 지도
CREATE TABLE IF NOT EXISTS public.course_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  distance_km DECIMAL(5,2),
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  surface TEXT CHECK (surface IN ('road', 'trail', 'track', 'mixed')) DEFAULT 'road',
  description TEXT,
  map_embed_url TEXT,
  images TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_maps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_public_read" ON public.course_maps;
CREATE POLICY "courses_public_read" ON public.course_maps FOR SELECT USING (true);

-- ============================================================
-- 초기 데이터 시드
-- ============================================================

-- 트레이닝 플랜 6개 (중복 실행 안전)
DELETE FROM public.training_plans WHERE title IN ('5K 입문 플랜','10K 입문 플랜','하프마라톤 중급 플랜','하프마라톤 고급 플랜','풀마라톤 입문 플랜','풀마라톤 중급 플랜');
INSERT INTO public.training_plans (title, target_distance, target_level, duration_weeks, description, weekly_structure) VALUES
(
  '5K 입문 플랜',
  '5k', 'beginner', 6,
  '달리기를 처음 시작하는 분들을 위한 6주 플랜. 걷기와 달리기를 번갈아가며 부상 없이 5K 완주를 목표로 합니다.',
  '[
    {"week": 1, "theme": "시작하기", "sessions": [{"day": "월", "type": "달리기+걷기", "distance": "2km", "notes": "1분 달리기 + 2분 걷기 × 6회"}, {"day": "수", "type": "휴식 또는 스트레칭", "distance": "-", "notes": "가벼운 스트레칭 15분"}, {"day": "금", "type": "달리기+걷기", "distance": "2.5km", "notes": "1분 달리기 + 1분 걷기 × 8회"}]},
    {"week": 2, "theme": "적응기", "sessions": [{"day": "월", "type": "달리기+걷기", "distance": "3km", "notes": "2분 달리기 + 1분 걷기 × 6회"}, {"day": "수", "type": "걷기", "distance": "3km", "notes": "빠르게 걷기 30분"}, {"day": "금", "type": "달리기+걷기", "distance": "3km", "notes": "2분 달리기 + 1분 걷기 × 7회"}]},
    {"week": 3, "theme": "지속력 향상", "sessions": [{"day": "월", "type": "달리기", "distance": "3km", "notes": "3분 달리기 + 1분 걷기 × 5회"}, {"day": "수", "type": "크로스 트레이닝", "distance": "-", "notes": "자전거 또는 수영 30분"}, {"day": "금", "type": "달리기", "distance": "3.5km", "notes": "5분 달리기 + 1분 걷기 × 4회"}]},
    {"week": 4, "theme": "거리 확장", "sessions": [{"day": "월", "type": "달리기", "distance": "3.5km", "notes": "8분 달리기 + 1분 걷기 × 3회"}, {"day": "수", "type": "휴식", "distance": "-", "notes": "충분한 휴식"}, {"day": "금", "type": "달리기", "distance": "4km", "notes": "10분 달리기 + 1분 걷기 × 3회"}]},
    {"week": 5, "theme": "자신감 키우기", "sessions": [{"day": "월", "type": "달리기", "distance": "4km", "notes": "15분 논스톱 달리기"}, {"day": "수", "type": "달리기", "distance": "3km", "notes": "편안한 페이스로 30분"}, {"day": "금", "type": "달리기", "distance": "4.5km", "notes": "20분 논스톱 달리기"}]},
    {"week": 6, "theme": "5K 완주!", "sessions": [{"day": "월", "type": "가벼운 달리기", "distance": "3km", "notes": "편안하게 몸 풀기"}, {"day": "수", "type": "휴식", "distance": "-", "notes": "대회 전 충분한 휴식"}, {"day": "토", "type": "5K 레이스", "distance": "5km", "notes": "드디어 5K 완주!"}]}
  ]'::jsonb
),
(
  '10K 입문 플랜',
  '10k', 'beginner', 8,
  '5K를 완주해본 분들을 위한 8주 플랜. 꾸준한 훈련으로 10K 완주를 목표로 합니다.',
  '[
    {"week": 1, "theme": "기반 다지기", "sessions": [{"day": "화", "type": "달리기", "distance": "4km", "notes": "편안한 페이스 유지"}, {"day": "목", "type": "달리기", "distance": "3km", "notes": "가벼운 달리기"}, {"day": "토", "type": "롱런", "distance": "5km", "notes": "천천히 완주"}]},
    {"week": 2, "theme": "규칙적인 훈련", "sessions": [{"day": "화", "type": "달리기", "distance": "5km", "notes": "일정한 페이스"}, {"day": "목", "type": "인터벌", "distance": "4km", "notes": "빠른 1분 + 느린 2분 × 5회"}, {"day": "토", "type": "롱런", "distance": "6km", "notes": "천천히 완주"}]},
    {"week": 3, "theme": "거리 늘리기", "sessions": [{"day": "화", "type": "달리기", "distance": "5km", "notes": "목표 페이스"}, {"day": "목", "type": "달리기", "distance": "4km", "notes": "편안하게"}, {"day": "토", "type": "롱런", "distance": "7km", "notes": "천천히"}]},
    {"week": 4, "theme": "회복 주간", "sessions": [{"day": "화", "type": "가벼운 달리기", "distance": "4km", "notes": "회복 달리기"}, {"day": "목", "type": "달리기", "distance": "3km", "notes": "짧게"}, {"day": "토", "type": "달리기", "distance": "5km", "notes": "몸 상태 확인"}]},
    {"week": 5, "theme": "강도 높이기", "sessions": [{"day": "화", "type": "인터벌", "distance": "6km", "notes": "1km 빠르게 + 0.5km 회복 × 4회"}, {"day": "목", "type": "달리기", "distance": "5km", "notes": "목표 페이스"}, {"day": "토", "type": "롱런", "distance": "8km", "notes": "천천히"}]},
    {"week": 6, "theme": "지구력 향상", "sessions": [{"day": "화", "type": "달리기", "distance": "6km", "notes": "일정 페이스"}, {"day": "목", "type": "템포런", "distance": "5km", "notes": "약간 빠른 페이스 20분"}, {"day": "토", "type": "롱런", "distance": "9km", "notes": "천천히"}]},
    {"week": 7, "theme": "테이퍼링 준비", "sessions": [{"day": "화", "type": "달리기", "distance": "5km", "notes": "가볍게"}, {"day": "목", "type": "달리기", "distance": "4km", "notes": "편안하게"}, {"day": "토", "type": "달리기", "distance": "6km", "notes": "컨디션 점검"}]},
    {"week": 8, "theme": "10K 완주!", "sessions": [{"day": "화", "type": "가벼운 달리기", "distance": "3km", "notes": "몸 풀기"}, {"day": "목", "type": "휴식", "distance": "-", "notes": "충분한 휴식"}, {"day": "일", "type": "10K 레이스", "distance": "10km", "notes": "10K 완주!"}]}
  ]'::jsonb
),
(
  '하프마라톤 중급 플랜',
  'half', 'intermediate', 12,
  '10K 경험이 있는 분들을 위한 12주 하프마라톤 완주 플랜. 주 4회 훈련으로 체계적으로 준비합니다.',
  '[{"week": 1, "theme": "기초 쌓기", "sessions": [{"day": "월", "type": "휴식", "distance": "-", "notes": ""}, {"day": "화", "type": "쉬운 달리기", "distance": "6km", "notes": ""}, {"day": "수", "type": "크로스 트레이닝", "distance": "-", "notes": "자전거 45분"}, {"day": "목", "type": "달리기", "distance": "8km", "notes": "중간 페이스"}, {"day": "금", "type": "휴식", "distance": "-", "notes": ""}, {"day": "토", "type": "롱런", "distance": "12km", "notes": "느리게"}]}]'::jsonb
),
(
  '하프마라톤 고급 플랜',
  'half', 'advanced', 10,
  '기록 단축을 목표로 하는 하프마라톤 고급 플랜. 스피드 훈련과 롱런을 결합한 체계적인 프로그램입니다.',
  '[{"week": 1, "theme": "스피드 기반", "sessions": [{"day": "화", "type": "인터벌", "distance": "10km", "notes": "400m × 8회"}, {"day": "목", "type": "템포런", "distance": "8km", "notes": "하프 페이스"}, {"day": "토", "type": "롱런", "distance": "16km", "notes": "목표 페이스"}]}]'::jsonb
),
(
  '풀마라톤 입문 플랜',
  'full', 'beginner', 18,
  '처음 풀마라톤에 도전하는 분들을 위한 18주 완주 플랜. 완주 자체를 목표로 부상 없이 훈련합니다.',
  '[{"week": 1, "theme": "시작", "sessions": [{"day": "화", "type": "달리기", "distance": "6km", "notes": ""}, {"day": "목", "type": "달리기", "distance": "6km", "notes": ""}, {"day": "토", "type": "롱런", "distance": "10km", "notes": ""}]}]'::jsonb
),
(
  '풀마라톤 중급 플랜',
  'full', 'intermediate', 16,
  '풀마라톤 경험이 있는 분들의 기록 단축을 위한 16주 플랜. 서브4 달성을 목표로 합니다.',
  '[{"week": 1, "theme": "기반 훈련", "sessions": [{"day": "화", "type": "달리기", "distance": "10km", "notes": "편안하게"}, {"day": "목", "type": "인터벌", "distance": "8km", "notes": "1km × 5"}, {"day": "토", "type": "롱런", "distance": "18km", "notes": "마라톤 페이스"}]}]'::jsonb
);

-- 전문가 칼럼 3개 (중복 실행 안전)
DELETE FROM public.columns WHERE slug IN ('marathon-beginner-guide','how-to-choose-running-shoes','essential-stretching-for-runners');
INSERT INTO public.columns (title, slug, content, excerpt, tags, published, published_at) VALUES
(
  '마라톤 입문자를 위한 완벽 가이드',
  'marathon-beginner-guide',
  '# 마라톤 입문자를 위한 완벽 가이드

## 왜 마라톤인가?

마라톤은 단순한 운동을 넘어 자신의 한계를 극복하는 여정입니다. 42.195km를 완주했을 때의 성취감은 그 어떤 것과도 비교할 수 없습니다.

## 시작하기 전 준비사항

### 1. 건강 체크
달리기를 시작하기 전에 기본적인 건강검진을 받는 것이 좋습니다. 특히 심폐 기능과 관절 상태를 확인하세요.

### 2. 적절한 러닝화 선택
러닝화는 가장 중요한 장비입니다. 발의 모양과 달리기 스타일에 맞는 신발을 선택하세요.

### 3. 점진적인 거리 증가
매주 10% 이상 거리를 늘리지 마세요. 과도한 훈련은 부상의 주요 원인입니다.

## 훈련 원칙

**80/20 법칙**: 훈련의 80%는 쉬운 강도로, 20%는 고강도로 진행합니다.

**충분한 휴식**: 달리기만큼 휴식도 중요합니다. 근육은 휴식 중에 회복됩니다.

**영양과 수분**: 훈련 전후로 적절한 영양 보충과 수분 섭취를 잊지 마세요.

## 대회 당일 준비

- 전날 충분한 수면
- 익숙한 음식으로 식사
- 레이스복은 사전에 착용해보기
- 페이스 조절 전략 세우기

마라톤은 준비가 절반입니다. 꾸준히 훈련하고 자신을 믿으세요!',
  '마라톤을 처음 시작하는 분들을 위한 기초부터 대회 준비까지 완벽 가이드',
  ARRAY['입문', '훈련', '마라톤'],
  true,
  NOW() - INTERVAL '7 days'
),
(
  '내 발에 맞는 러닝화 고르는 법',
  'how-to-choose-running-shoes',
  '# 내 발에 맞는 러닝화 고르는 법

## 발의 유형 파악하기

좋은 러닝화 선택의 첫 걸음은 자신의 발 유형을 아는 것입니다.

### 아치 유형
- **정상 아치(Normal Arch)**: 대부분의 러닝화에 적합
- **낮은 아치(Flat Foot)**: 모션 컨트롤 또는 스태빌리티 슈즈 추천
- **높은 아치(High Arch)**: 쿠셔닝이 좋은 신발 추천

### 착지 유형 (Gait Analysis)
- **힐 스트라이커**: 뒤꿈치로 먼저 착지 — 쿠셔닝 중요
- **미드풋 스트라이커**: 발 중앙으로 착지 — 밸런스된 신발
- **포어풋 스트라이커**: 발 앞쪽으로 착지 — 가벼운 신발

## 주요 카테고리

### 데일리 트레이너
매일 훈련에 사용하는 신발. 내구성과 쿠셔닝이 중요합니다.

### 레이스 슈즈
대회용으로 가볍고 빠릅니다. 일반 훈련에는 적합하지 않습니다.

### 트레일 러닝화
산악 코스용. 그립감과 방수 기능이 핵심입니다.

## 구매 시 체크리스트

1. 오후에 구매 (발이 가장 큰 시간)
2. 달리기용 양말을 신고 착용
3. 엄지발가락과 신발 끝 사이에 1cm 여유
4. 발볼이 편안한지 확인
5. 매장에서 짧게 달려보기',
  '아치 유형부터 착지 유형까지, 내 발에 딱 맞는 러닝화를 고르는 완벽한 방법',
  ARRAY['러닝화', '장비', '쇼핑'],
  true,
  NOW() - INTERVAL '3 days'
),
(
  '달리기 전후 꼭 해야 할 스트레칭',
  'essential-stretching-for-runners',
  '# 달리기 전후 꼭 해야 할 스트레칭

## 워밍업 (달리기 전)

달리기 전 워밍업은 **동적 스트레칭**이 핵심입니다. 근육을 늘리는 것이 아니라 활성화시키는 것이 목적입니다.

### 동적 스트레칭 루틴 (5-10분)

**레그 스윙 (다리 흔들기)**
- 한 발로 서서 다른 다리를 앞뒤로 흔들기
- 각 다리 20회

**하이 니즈 (무릎 높이 올리기)**
- 제자리에서 무릎을 허리 높이까지 올리며 달리기
- 20m × 2회

**버트 킥스 (뒤꿈치 엉덩이 차기)**
- 달리면서 발뒤꿈치로 엉덩이 터치
- 20m × 2회

**사이드 스텝**
- 옆으로 이동하며 엉덩이 외전근 활성화
- 10m 왕복 × 2회

## 쿨다운 (달리기 후)

달리기 후에는 **정적 스트레칭**으로 근육을 이완시킵니다.

### 정적 스트레칭 루틴 (10-15분)

**종아리 스트레칭**
- 벽에 손을 대고 뒷다리 펴기
- 각 30초 × 2회

**햄스트링 스트레칭**
- 앉아서 발끝 잡기
- 각 30초

**쿼드 스트레칭 (허벅지 앞)**
- 한 발로 서서 뒷발 잡기
- 각 30초 × 2회

**IT 밴드 스트레칭**
- 발을 교차하고 옆으로 기울이기
- 각 30초

## 주의사항

- 통증이 느껴지면 즉시 중단
- 스트레칭은 반동을 주지 말고 천천히
- 차가운 근육에 무리한 스트레칭 금지',
  '부상 예방을 위해 달리기 전후 반드시 해야 할 필수 스트레칭 루틴',
  ARRAY['스트레칭', '부상예방', '훈련'],
  true,
  NOW() - INTERVAL '1 day'
);

-- 코스 지도 5개 (중복 실행 안전)
DELETE FROM public.course_maps WHERE name IN ('한강공원 러닝 코스','남산 순환 코스','올림픽공원 둘레길','부산 해운대-광안리 코스','제주 올레길 7코스');
INSERT INTO public.course_maps (name, location, distance_km, difficulty, surface, description, map_embed_url) VALUES
(
  '한강공원 러닝 코스',
  '서울 한강',
  10.00,
  'easy',
  'road',
  '서울 한강을 따라 달리는 평탄한 코스입니다. 뚝섬에서 잠실까지 이어지는 자전거·러닝 전용 도로로, 야경이 아름답습니다. 화장실과 편의시설이 잘 갖춰져 있어 입문자에게 적합합니다.',
  'https://map.kakao.com/link/map/한강공원러닝코스,37.527222,127.057778'
),
(
  '남산 순환 코스',
  '서울 남산',
  7.00,
  'moderate',
  'mixed',
  '남산을 한 바퀴 도는 오르막·내리막이 포함된 코스입니다. 서울 시내 전망이 뛰어나며, 숲길과 포장도로가 혼합되어 있습니다. 중급자 이상에게 추천합니다.',
  'https://map.kakao.com/link/map/남산공원,37.550870,126.988040'
),
(
  '올림픽공원 둘레길',
  '서울 송파구',
  5.00,
  'easy',
  'road',
  '올림픽공원 내부 둘레길로, 넓은 잔디밭과 조각 작품 사이를 달리는 코스입니다. 평탄하고 차량 통행이 없어 초보자에게 최적입니다.',
  'https://map.kakao.com/link/map/올림픽공원,37.521389,127.121111'
),
(
  '부산 해운대-광안리 코스',
  '부산 해운대',
  8.50,
  'easy',
  'road',
  '해운대 해수욕장에서 광안리까지 이어지는 해변 코스입니다. 바다를 바라보며 달리는 최고의 뷰를 자랑하며, 광안대교 야경도 즐길 수 있습니다.',
  'https://map.kakao.com/link/map/해운대해수욕장,35.158889,129.160278'
),
(
  '제주 올레길 7코스',
  '제주 서귀포',
  17.60,
  'moderate',
  'trail',
  '서귀포 외돌개에서 월평까지 이어지는 제주 올레길 7코스입니다. 바다와 오름이 어우러진 제주의 아름다운 자연을 감상하며 달릴 수 있습니다.',
  'https://map.kakao.com/link/map/외돌개,33.240278,126.511111'
);
