'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StarRating from '@/components/ui/StarRating'

type MyReview = {
  id: string
  rating: number
  title: string | null
  content: string
  like_count: number
  created_at: string
  products: { id: string; name: string; brand: string; images: string[] } | null
}

type MyCollection = {
  id: string
  product_id: string
  status: 'using' | 'used' | 'wishlist'
  created_at: string
  products?: { id: string; name: string; brand: string; images: string[]; avg_rating: number }
}

const COLLECTION_LABEL = {
  using: '신고 있어요',
  used: '신었어요',
  wishlist: '신고 싶어요',
}

export default function MyPage() {
  const [tab, setTab] = useState<'reviews' | 'collections'>('reviews')
  const [reviews, setReviews] = useState<MyReview[]>([])
  const [collections, setCollections] = useState<MyCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    async function load() {
      const [userRes, reviewRes, colRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/reviews/my'),
        fetch('/api/collections/my'),
      ])
      if (userRes.ok) setUser(await userRes.json())
      if (reviewRes.ok) setReviews(await reviewRes.json())
      if (colRes.ok) setCollections(await colRes.json())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-white/30 text-sm text-center py-20">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">마이페이지</h1>
        {user && <p className="text-white/40 text-sm mt-1">{user.email}</p>}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {(['reviews', 'collections'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-[#FF4D00] text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {t === 'reviews' ? `리뷰 ${reviews.length}` : `컬렉션 ${collections.length}`}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              아직 작성한 리뷰가 없습니다.
              <br />
              <Link href="/shoes" className="text-[#FF4D00] mt-2 inline-block">러닝화 둘러보기 →</Link>
            </div>
          ) : (
            reviews.map((review) => {
              const product = Array.isArray(review.products)
                ? (review.products[0] ?? null)
                : review.products
              return (
                <div key={review.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                  <Link href={`/shoes/${product?.id}`} className="flex items-center gap-3 mb-3 group">
                    <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden shrink-0">
                      {product?.images?.[0]
                        ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">👟</div>
                      }
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">{product?.brand}</p>
                      <p className="text-white text-sm font-semibold group-hover:text-[#FF4D00] transition-colors">{product?.name}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating value={Number(review.rating)} readonly size="sm" />
                    <span className="text-white/40 text-xs">{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {review.title && <p className="text-white font-semibold text-sm mb-1">{review.title}</p>}
                  <p className="text-white/60 text-sm line-clamp-2">{review.content}</p>
                  <div className="flex gap-3 mt-3">
                    <Link href={`/shoes/${product?.id}/review`} className="text-xs text-white/30 hover:text-white transition-colors">수정</Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div>
          {collections.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              아직 저장한 러닝화가 없습니다.
              <br />
              <Link href="/shoes" className="text-[#FF4D00] mt-2 inline-block">러닝화 둘러보기 →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(['using', 'used', 'wishlist'] as const).map((status) => {
                const items = collections.filter((c) => c.status === status)
                if (!items.length) return null
                return (
                  <div key={status}>
                    <p className="text-white/40 text-xs mb-2">{COLLECTION_LABEL[status]} ({items.length})</p>
                    <div className="grid grid-cols-3 gap-3">
                      {items.map((item) => {
                        const product = Array.isArray(item.products)
                          ? (item.products[0] ?? null)
                          : item.products
                        return (
                          <Link key={item.id} href={`/shoes/${item.product_id}`}
                            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 hover:border-white/20 transition-all"
                          >
                            <div className="w-full aspect-square bg-white/5 rounded-lg mb-2 overflow-hidden">
                              {product?.images?.[0]
                                ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">👟</div>
                              }
                            </div>
                            <p className="text-white/40 text-[10px] truncate">{product?.brand}</p>
                            <p className="text-white text-xs font-semibold truncate">{product?.name ?? '—'}</p>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
