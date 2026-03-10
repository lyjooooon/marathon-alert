import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CollectionButton from '@/components/product/CollectionButton'
import ReviewSection from './ReviewSection'
import StarRating from '@/components/ui/StarRating'

const CUSHION_LABEL: Record<string, string> = {
  max: '맥스쿠션', moderate: '미들쿠션', minimal: '미니멀', racing: '레이싱',
}
const SURFACE_LABEL: Record<string, string> = {
  road: '로드', trail: '트레일', track: '트랙', mixed: '혼합',
}

async function getProduct(id: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('products').select('*').eq('id', id).eq('is_published', true).single()
  return data
}

async function getRatingDistribution(productId: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('reviews').select('rating').eq('product_id', productId)
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of data ?? []) {
    const rounded = Math.round(Number(r.rating))
    dist[rounded] = (dist[rounded] ?? 0) + 1
  }
  return dist
}

async function getUserCollection(productId: string, userId: string) {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('user_collections')
    .select('status')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()
  return data?.status ?? null
}

async function getUserReview(productId: string, userId: string) {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('reviews')
    .select('id, rating')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()
  return data
}

export default async function ShoeDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [dist, collectionStatus, userReview] = await Promise.all([
    getRatingDistribution(params.id),
    user ? getUserCollection(params.id, user.id) : null,
    user ? getUserReview(params.id, user.id) : null,
  ])

  const total = Object.values(dist).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 네비 */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/shoes" className="text-white/40 hover:text-white transition-colors">러닝화</Link>
        <span className="text-white/20">›</span>
        <span className="text-white/60">{product.brand}</span>
      </div>

      {/* 이미지 + 기본 정보 */}
      <div className="flex gap-6 mb-8">
        <div className="w-48 h-48 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl opacity-20">👟</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[#FF4D00] text-sm font-semibold mb-0.5">{product.brand}</p>
          <h1 className="text-2xl font-black text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <StarRating value={Number(product.avg_rating)} readonly size="md" />
            <span className="text-white font-bold text-lg">{Number(product.avg_rating).toFixed(1)}</span>
            <span className="text-white/40 text-sm">리뷰 {product.review_count}개</span>
          </div>

          {/* 스펙 태그 */}
          <div className="flex gap-2 flex-wrap mb-4">
            {product.cushion_type && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                {CUSHION_LABEL[product.cushion_type] ?? product.cushion_type}
              </span>
            )}
            {product.surface && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                {SURFACE_LABEL[product.surface] ?? product.surface}
              </span>
            )}
            {product.weight_g && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                {product.weight_g}g
              </span>
            )}
            {product.drop_mm != null && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                드롭 {product.drop_mm}mm
              </span>
            )}
            {product.stack_height_mm && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                스택 {product.stack_height_mm}mm
              </span>
            )}
            {product.release_year && (
              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-lg">
                {product.release_year}
              </span>
            )}
          </div>

          {/* 컬렉션 버튼 */}
          <CollectionButton
            productId={product.id}
            initialStatus={collectionStatus as 'using' | 'used' | 'wishlist' | null}
            isLoggedIn={!!user}
          />
        </div>
      </div>

      {/* 설명 */}
      {product.description && (
        <p className="text-white/50 text-sm leading-relaxed mb-8 bg-white/3 rounded-xl p-4 border border-white/5">
          {product.description}
        </p>
      )}

      {/* 별점 분포 */}
      {total > 0 && (
        <div className="mb-8 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4">별점 분포</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-3 text-right">{star}</span>
                  <span className="text-[#FF4D00] text-xs">★</span>
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#FF4D00] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs w-8 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 내 별점 / 리뷰 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">리뷰 {product.review_count}개</h2>
        {user ? (
          userReview ? (
            <Link
              href={`/shoes/${product.id}/review`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <StarRating value={Number(userReview.rating)} readonly size="sm" />
              <span className="text-xs">수정</span>
            </Link>
          ) : (
            <Link
              href={`/shoes/${product.id}/review`}
              className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-xl px-4 py-2 transition-colors"
            >
              리뷰 쓰기
            </Link>
          )
        ) : (
          <Link
            href={`/login?next=/shoes/${product.id}/review`}
            className="bg-white/10 hover:bg-white/15 text-white/60 text-sm rounded-xl px-4 py-2 transition-colors"
          >
            로그인하고 리뷰 쓰기
          </Link>
        )}
      </div>

      {/* 리뷰 섹션 (클라이언트) */}
      <ReviewSection productId={product.id} userId={user?.id ?? null} />
    </div>
  )
}
