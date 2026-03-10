'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  category: string
  like_count: number
  is_best: boolean
  created_at: string
  profiles: { username: string } | null
}

const CATEGORIES = ['all', '훈련팁', '코스추천', '장비리뷰', '대회후기']
const CATEGORY_COLORS: Record<string, string> = {
  '훈련팁': '#3b82f6',
  '코스추천': '#22c55e',
  '장비리뷰': '#f59e0b',
  '대회후기': '#FF4D00',
}

export default function InfoPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<'latest' | 'best'>('latest')
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ category, sort })
    const res = await fetch(`/api/info-posts?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPosts(data)
    }
    setLoading(false)
  }, [category, sort])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">유저 정보 포스트</h1>
          <p className="text-white/40 text-sm mt-0.5">러너들이 직접 올린 훈련팁·코스·장비·대회후기</p>
        </div>
        <Link
          href="/info/posts/new"
          className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
        >
          + 글쓰기
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setSort('latest') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c && sort !== 'best'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {c === 'all' ? '전체' : c}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setSort('best'); setCategory('all') }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ml-auto flex items-center gap-1 ${
            sort === 'best'
              ? 'bg-[#FF4D00] text-white'
              : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          🏆 베스트
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm mb-4">아직 포스트가 없습니다.</p>
          <Link href="/info/posts/new" className="text-[#FF4D00] text-sm font-semibold hover:underline">
            첫 번째 포스트를 작성해보세요 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/info/posts/${post.id}`}
              className="block bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: `${CATEGORY_COLORS[post.category] ?? '#fff'}22`, color: CATEGORY_COLORS[post.category] ?? '#fff' }}
                    >
                      {post.category}
                    </span>
                    {post.is_best && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#FF4D00]/20 text-[#FF4D00]">🏆 베스트</span>
                    )}
                  </div>
                  <p className="text-white font-semibold truncate">{post.title}</p>
                  <p className="text-white/30 text-xs mt-1">
                    {post.profiles?.username ?? '익명'} · {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="text-white/40 text-xs flex items-center gap-1 shrink-0">
                  <span>👍</span>
                  <span>{post.like_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
