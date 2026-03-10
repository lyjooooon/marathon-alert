'use client'

import { useState, useEffect } from 'react'

type Post = {
  id: string
  title: string
  category: string
  like_count: number
  is_best: boolean
  created_at: string
  user_id: string
}

const CATEGORY_COLORS: Record<string, string> = {
  '훈련팁': '#3b82f6',
  '코스추천': '#22c55e',
  '장비리뷰': '#f59e0b',
  '대회후기': '#FF4D00',
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    const res = await fetch('/api/admin/posts')
    if (res.ok) setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const toggleBest = async (post: Post) => {
    await fetch(`/api/admin/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_best: !post.is_best }),
    })
    fetchPosts()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">유저 포스트</h1>
        <p className="text-white/40 text-xs mt-0.5">{posts.length}개 · 베스트 수동 설정 가능</p>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-12">포스트가 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{ background: `${CATEGORY_COLORS[post.category] ?? '#fff'}22`, color: CATEGORY_COLORS[post.category] ?? '#fff' }}
                  >
                    {post.category}
                  </span>
                  {post.is_best && (
                    <span className="text-xs font-black text-[#FF4D00]">🏆 베스트</span>
                  )}
                </div>
                <p className="text-white font-semibold text-sm truncate">{post.title}</p>
                <p className="text-white/30 text-xs mt-0.5">
                  추천 {post.like_count} · {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleBest(post)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                    post.is_best
                      ? 'bg-[#FF4D00]/20 text-[#FF4D00] hover:bg-[#FF4D00]/30'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {post.is_best ? '베스트 해제' : '베스트 설정'}
                </button>
                <button onClick={() => handleDelete(post.id, post.title)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
