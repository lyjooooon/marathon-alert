'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

type Post = {
  id: string
  title: string
  content: string
  category: string
  like_count: number
  is_best: boolean
  created_at: string
  updated_at: string
  user_id?: string
  profiles: { username: string } | null
}

const CATEGORY_COLORS: Record<string, string> = {
  '훈련팁': '#3b82f6',
  '코스추천': '#22c55e',
  '장비리뷰': '#f59e0b',
  '대회후기': '#FF4D00',
}

export default function InfoPostDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })

    Promise.all([
      fetch(`/api/info-posts/${id}`).then((r) => r.json()),
      fetch(`/api/info-posts/${id}/like`).then((r) => r.json()),
    ]).then(([postData, likeData]) => {
      if (!postData.error) {
        setPost(postData)
        setLikeCount(postData.like_count)
      }
      setLiked(likeData.liked)
      setLoading(false)
    })
  }, [id])

  const handleLike = async () => {
    if (!currentUserId) {
      router.push(`/login?next=/info/posts/${id}`)
      return
    }
    setLikeLoading(true)
    const res = await fetch(`/api/info-posts/${id}/like`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount((c) => data.liked ? c + 1 : c - 1)
    }
    setLikeLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('포스트를 삭제하시겠습니까?')) return
    const res = await fetch(`/api/info-posts/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/info/posts')
  }

  if (loading) {
    return <div className="text-white/30 text-center py-20 text-sm">불러오는 중...</div>
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-white/30 text-sm">포스트를 찾을 수 없습니다.</p>
        <Link href="/info/posts" className="text-[#FF4D00] text-sm mt-4 inline-block hover:underline">목록으로</Link>
      </div>
    )
  }

  const isOwner = currentUserId && post.profiles && currentUserId === post.user_id

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/info/posts" className="text-white/40 hover:text-white text-sm transition-colors mb-6 inline-block">
        ← 목록으로
      </Link>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
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

        <h1 className="text-white font-black text-xl mb-3">{post.title}</h1>

        <div className="flex items-center justify-between text-white/30 text-xs mb-6 pb-4 border-b border-white/10">
          <span>{post.profiles?.username ?? '익명'} · {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {isOwner && (
            <div className="flex gap-3">
              <button onClick={handleDelete} className="text-red-400/60 hover:text-red-400 transition-colors">삭제</button>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</div>

        {/* 추천 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              liked
                ? 'bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-lg">👍</span>
            <span>추천 {likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
