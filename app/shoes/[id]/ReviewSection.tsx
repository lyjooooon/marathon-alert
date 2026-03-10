'use client'

import { useState, useEffect } from 'react'
import StarRating from '@/components/ui/StarRating'

type Review = {
  id: string
  rating: number
  title: string | null
  content: string
  pros: string | null
  cons: string | null
  like_count: number
  created_at: string
  profiles: { username: string; avatar_url: string | null } | null
}

const SORT_OPTIONS = [
  { value: 'recent', label: '최신순' },
  { value: 'helpful', label: '도움순' },
  { value: 'rating_high', label: '별점높은순' },
  { value: 'rating_low', label: '별점낮은순' },
]

export default function ReviewSection({ productId, userId }: { productId: string; userId: string | null }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [sort, setSort] = useState('recent')
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  async function fetchReviews() {
    setLoading(true)
    const res = await fetch(`/api/reviews?product_id=${productId}&sort=${sort}`)
    if (res.ok) setReviews(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [productId, sort])

  async function handleLike(reviewId: string) {
    if (!userId) return
    const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' })
    if (res.ok) {
      const { liked } = await res.json()
      setLikedIds((prev) => {
        const next = new Set(prev)
        if (liked) next.add(reviewId)
        else next.delete(reviewId)
        return next
      })
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, like_count: r.like_count + (liked ? 1 : -1) } : r
        )
      )
    }
  }

  if (loading) return <div className="text-white/30 text-sm text-center py-8">불러오는 중...</div>
  if (reviews.length === 0) return (
    <div className="text-center py-12 text-white/30 text-sm">
      아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
    </div>
  )

  return (
    <div>
      {/* 정렬 */}
      <div className="flex gap-1.5 mb-4">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setSort(o.value)}
            className={`px-3 py-1 rounded-full text-xs transition-all border ${
              sort === o.value
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const profile = Array.isArray(review.profiles)
            ? (review.profiles[0] ?? null)
            : review.profiles
          return (
            <div key={review.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                        {profile?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{profile?.username ?? '익명'}</p>
                    <p className="text-white/30 text-xs">{new Date(review.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
                <StarRating value={Number(review.rating)} readonly size="sm" />
              </div>

              {/* 제목 */}
              {review.title && (
                <p className="text-white font-semibold text-sm mb-2">{review.title}</p>
              )}

              {/* 본문 */}
              <p className="text-white/70 text-sm leading-relaxed mb-3">{review.content}</p>

              {/* 장단점 */}
              {(review.pros || review.cons) && (
                <div className="space-y-1.5 mb-3">
                  {review.pros && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400 shrink-0">+ 장점</span>
                      <span className="text-white/50">{review.pros}</span>
                    </div>
                  )}
                  {review.cons && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-red-400 shrink-0">- 단점</span>
                      <span className="text-white/50">{review.cons}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 도움이 됐어요 */}
              <button
                onClick={() => handleLike(review.id)}
                disabled={!userId}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  likedIds.has(review.id)
                    ? 'text-[#FF4D00]'
                    : 'text-white/30 hover:text-white/60'
                } disabled:cursor-default`}
              >
                <span>👍</span>
                <span>도움이 됐어요 {review.like_count > 0 ? review.like_count : ''}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
