'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import StarRating from '@/components/ui/StarRating'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors placeholder:text-white/20'

export default function WriteReviewPage() {
  const { id: productId } = useParams() as { id: string }
  const router = useRouter()

  const [product, setProduct] = useState<{ name: string; brand: string } | null>(null)
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      const [productRes, reviewsRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/reviews?product_id=${productId}&sort=recent`),
      ])
      if (productRes.ok) setProduct(await productRes.json())

      // 현재 유저의 기존 리뷰 찾기 (서버에서 필터링)
      const myReviewRes = await fetch(`/api/reviews/my?product_id=${productId}`)
      if (myReviewRes.ok) {
        const myReview = await myReviewRes.json()
        if (myReview) {
          setExistingReviewId(myReview.id)
          setRating(Number(myReview.rating))
          setTitle(myReview.title ?? '')
          setContent(myReview.content ?? '')
          setPros(myReview.pros ?? '')
          setCons(myReview.cons ?? '')
        }
      }
      setFetching(false)
    }
    load()
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('별점을 선택해주세요.'); return }
    if (!content.trim()) { setError('리뷰 내용을 입력해주세요.'); return }

    setLoading(true)
    setError('')

    let res: Response
    if (existingReviewId) {
      res = await fetch(`/api/reviews/${existingReviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, content, pros, cons }),
      })
    } else {
      res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, title, content, pros, cons }),
      })
    }

    if (res.ok) {
      router.push(`/shoes/${productId}`)
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!existingReviewId || !confirm('리뷰를 삭제하시겠습니까?')) return
    await fetch(`/api/reviews/${existingReviewId}`, { method: 'DELETE' })
    router.push(`/shoes/${productId}`)
  }

  if (fetching) return <div className="text-white/30 text-sm text-center py-20">불러오는 중...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/shoes/${productId}`} className="text-white/40 hover:text-white text-sm transition-colors">← 뒤로</Link>
        <h1 className="text-xl font-black text-white">
          {existingReviewId ? '리뷰 수정' : '리뷰 쓰기'}
        </h1>
      </div>

      {product && (
        <div className="mb-6 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
          <p className="text-white/40 text-xs">{product.brand}</p>
          <p className="text-white font-semibold text-sm">{product.name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 별점 */}
        <div>
          <label className="block text-white/60 text-xs mb-3">별점 *</label>
          <div className="flex items-center gap-4">
            <StarRating value={rating} onChange={setRating} size="lg" />
            <span className="text-white/40 text-sm">
              {rating === 0 ? '별점을 선택하세요' : `${rating}점`}
            </span>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">제목 <span className="text-white/20">(선택)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="한 줄 요약"
            className={inputCls}
          />
        </div>

        {/* 본문 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">리뷰 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="착화감, 내구성, 디자인 등 자유롭게 작성해주세요"
            rows={5}
            className={inputCls + ' resize-none'}
          />
        </div>

        {/* 장점 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">장점 <span className="text-white/20">(선택)</span></label>
          <input
            type="text"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="가볍고 반발력이 좋아요"
            className={inputCls}
          />
        </div>

        {/* 단점 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">단점 <span className="text-white/20">(선택)</span></label>
          <input
            type="text"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="가격이 비싸요"
            className={inputCls}
          />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex items-center gap-3 justify-between pt-2">
          {existingReviewId && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
            >
              삭제
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <Link href={`/shoes/${productId}`} className="px-4 py-2 text-white/40 text-sm hover:text-white transition-colors">
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-xl px-6 py-2 transition-colors"
            >
              {loading ? '저장 중...' : (existingReviewId ? '수정' : '등록')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
