import { getSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import StarRating from '@/components/ui/StarRating'

async function getTopProducts() {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('products')
    .select('id, name, brand, images, avg_rating, review_count, collection_count, weight_g, cushion_type, surface, price_krw')
    .eq('is_published', true)
    .order('avg_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(6)
  return data ?? []
}

async function getRecentReviews() {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('reviews')
    .select(`id, rating, title, content, created_at,
      profiles!reviews_user_id_fkey (username, avatar_url),
      products!reviews_product_id_fkey (id, name, brand, images)`)
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

const BRANDS = ['Nike', 'Adidas', 'ASICS', 'Hoka', 'Brooks', 'On', 'New Balance', 'Saucony', 'Mizuno']

export default async function HomePage() {
  const [topProducts, recentReviews] = await Promise.all([getTopProducts(), getRecentReviews()])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 히어로 */}
      <div className="mb-12 text-center py-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          <span className="text-[#FF4D00]">SOLE</span>
        </h1>
        <p className="text-white/40 text-base">러닝화 리뷰 플랫폼 — 신어본 사람들의 진짜 평가</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/shoes" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            러닝화 둘러보기
          </Link>
          <Link href="/ranking" className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors border border-white/10">
            랭킹 보기
          </Link>
        </div>
      </div>

      {/* TOP 러닝화 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">TOP 러닝화</h2>
          <Link href="/shoes?sort=rating" className="text-white/40 hover:text-white text-xs transition-colors">전체 보기 →</Link>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">등록된 제품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 최근 리뷰 */}
      <section className="mb-12">
        <h2 className="text-white font-black text-lg mb-4">최근 리뷰</h2>
        {recentReviews.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">아직 리뷰가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const profile = Array.isArray(review.profiles) ? (review.profiles[0] ?? null) : review.profiles
              const product = Array.isArray(review.products) ? (review.products[0] ?? null) : review.products
              return (
                <Link
                  key={review.id}
                  href={`/shoes/${product?.id}`}
                  className="flex gap-4 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3.5 hover:border-white/20 transition-all"
                >
                  {/* 제품 이미지 */}
                  <div className="w-12 h-12 shrink-0 bg-white/5 rounded-lg overflow-hidden">
                    {product?.images?.[0]
                      ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">👟</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/60 text-xs">{product?.brand}</span>
                      <span className="text-white font-semibold text-xs truncate">{product?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={Number(review.rating)} readonly size="sm" />
                      <span className="text-white/30 text-xs">{profile?.username ?? '익명'}</span>
                      <span className="text-white/20 text-xs">{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {review.title && <p className="text-white/70 text-xs font-semibold">{review.title}</p>}
                    <p className="text-white/40 text-xs truncate">{review.content}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* 브랜드 탐색 */}
      <section>
        <h2 className="text-white font-black text-lg mb-4">브랜드 탐색</h2>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <Link
              key={brand}
              href={`/shoes?brand=${encodeURIComponent(brand)}`}
              className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
