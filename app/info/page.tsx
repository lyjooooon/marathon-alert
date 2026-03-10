import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'

const SECTIONS = [
  { href: '/info/plans', icon: '📋', title: '트레이닝 플랜', desc: '5K부터 풀마라톤까지 레벨별 맞춤 훈련 계획', color: '#3b82f6' },
  { href: '/info/courses', icon: '🗺️', title: '코스 지도', desc: '전국 인기 러닝 코스와 상세 경로 안내', color: '#22c55e' },
  { href: '/info/columns', icon: '✍️', title: '전문가 칼럼', desc: '러닝 전문가가 알려주는 훈련·장비·영양 팁', color: '#f59e0b' },
  { href: '/info/coach', icon: '🤖', title: 'AI 코치', desc: '언제든지 묻고 답하는 나만의 러닝 코치', color: '#FF4D00', badge: 'AI' },
]

const CATEGORY_COLORS: Record<string, string> = {
  '훈련팁': '#3b82f6',
  '코스추천': '#22c55e',
  '장비리뷰': '#f59e0b',
  '대회후기': '#FF4D00',
}

type BestPost = {
  id: string
  title: string
  category: string
  like_count: number
  profiles: { username: string } | null
}

async function getBestPosts(): Promise<BestPost[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('info_posts')
      .select('id, title, category, like_count, profiles!info_posts_user_id_fkey(username)')
      .eq('is_best', true)
      .order('like_count', { ascending: false })
      .limit(5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((p: any) => ({
      ...p,
      profiles: Array.isArray(p.profiles) ? (p.profiles[0] ?? null) : p.profiles,
    })) as BestPost[]
  } catch {
    return []
  }
}

export default async function InfoPage() {
  const bestPosts = await getBestPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">정보 허브</h1>
        <p className="text-white/40 text-sm mt-1">더 잘 달리기 위한 모든 정보</p>
      </div>

      {/* 큐레이션 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{s.icon}</span>
              {s.badge && (
                <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: `${s.color}22`, color: s.color }}>{s.badge}</span>
              )}
            </div>
            <h2 className="text-white font-bold text-lg mb-1 group-hover:text-[#FF4D00] transition-colors">{s.title}</h2>
            <p className="text-white/40 text-sm">{s.desc}</p>
            <div className="mt-4 text-xs font-semibold" style={{ color: s.color }}>바로가기 →</div>
          </Link>
        ))}
      </div>

      {/* 유저 포스트 섹션 */}
      <div className="border-t border-white/10 pt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-white">러너 정보 포스트</h2>
            <p className="text-white/40 text-xs mt-0.5">러너들이 직접 올린 훈련팁·코스·장비·대회후기</p>
          </div>
          <div className="flex gap-2">
            <Link href="/info/posts/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-xs rounded-lg px-3 py-1.5 transition-colors">
              + 글쓰기
            </Link>
            <Link href="/info/posts" className="bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-xs rounded-lg px-3 py-1.5 transition-colors">
              전체보기
            </Link>
          </div>
        </div>

        {bestPosts.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black text-[#FF4D00]">🏆 베스트</span>
              <span className="text-white/20 text-xs">추천 3개 이상</span>
            </div>
            <div className="space-y-2 mb-6">
              {bestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/info/posts/${post.id}`}
                  className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 hover:border-[#FF4D00]/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md shrink-0"
                      style={{ background: `${CATEGORY_COLORS[post.category] ?? '#fff'}22`, color: CATEGORY_COLORS[post.category] ?? '#fff' }}
                    >
                      {post.category}
                    </span>
                    <span className="text-white text-sm font-semibold truncate group-hover:text-[#FF4D00] transition-colors">
                      {post.title}
                    </span>
                  </div>
                  <div className="text-white/30 text-xs flex items-center gap-1 shrink-0 ml-3">
                    <span>👍</span>
                    <span>{post.like_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-8 text-center mb-6">
            <p className="text-white/30 text-sm">아직 베스트 포스트가 없습니다.</p>
            <p className="text-white/20 text-xs mt-1">추천을 3개 이상 받으면 베스트에 올라옵니다.</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/info/posts" className="text-white/40 hover:text-white text-xs transition-colors">
            모든 포스트 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
