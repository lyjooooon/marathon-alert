import { getSupabaseAdmin } from '@/lib/supabase'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'

const BRANDS = ['Nike', 'Adidas', 'ASICS', 'Hoka', 'Brooks', 'On', 'New Balance', 'Saucony', 'Mizuno']
const CUSHIONS = [
  { value: 'max', label: '맥스쿠션' },
  { value: 'moderate', label: '미들쿠션' },
  { value: 'minimal', label: '미니멀' },
  { value: 'racing', label: '레이싱' },
]
const SURFACES = [
  { value: 'road', label: '로드' },
  { value: 'trail', label: '트레일' },
  { value: 'track', label: '트랙' },
]

async function getProducts({ brand, cushion, surface, sort }: {
  brand?: string; cushion?: string; surface?: string; sort?: string
}) {
  const db = getSupabaseAdmin()
  let query = db
    .from('products')
    .select('id, name, brand, images, avg_rating, review_count, collection_count, weight_g, cushion_type, surface, price_krw')
    .eq('is_published', true)

  if (brand) query = query.eq('brand', brand)
  if (cushion) query = query.eq('cushion_type', cushion)
  if (surface) query = query.eq('surface', surface)

  if (sort === 'rating') query = query.order('avg_rating', { ascending: false }).order('review_count', { ascending: false })
  else if (sort === 'new') query = query.order('release_year', { ascending: false })
  else query = query.order('review_count', { ascending: false }).order('avg_rating', { ascending: false })

  const { data } = await query
  return data ?? []
}

export default async function ShoesPage({
  searchParams,
}: {
  searchParams: { brand?: string; cushion?: string; surface?: string; sort?: string }
}) {
  const { brand, cushion, surface, sort = 'popular' } = searchParams
  const products = await getProducts({ brand, cushion, surface, sort })

  function filterLink(key: string, value: string) {
    const p = new URLSearchParams()
    if (brand) p.set('brand', brand)
    if (cushion) p.set('cushion', cushion)
    if (surface) p.set('surface', surface)
    if (sort) p.set('sort', sort)
    const current = searchParams[key as keyof typeof searchParams]
    if (current === value) p.delete(key)
    else p.set(key, value)
    return `/shoes?${p.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">러닝화</h1>
        <p className="text-white/40 text-sm mt-0.5">{products.length}개</p>
      </div>

      {/* 필터 */}
      <div className="space-y-3 mb-6">
        {/* 브랜드 */}
        <div className="flex gap-2 flex-wrap">
          {BRANDS.map((b) => (
            <Link
              key={b}
              href={filterLink('brand', b)}
              className={`px-3 py-1 rounded-full text-xs transition-all border ${
                brand === b
                  ? 'bg-[#FF4D00] border-[#FF4D00] text-white font-semibold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {b}
            </Link>
          ))}
        </div>

        {/* 쿠션 / 서페이스 / 정렬 */}
        <div className="flex gap-2 flex-wrap items-center">
          {CUSHIONS.map((c) => (
            <Link
              key={c.value}
              href={filterLink('cushion', c.value)}
              className={`px-3 py-1 rounded-full text-xs transition-all border ${
                cushion === c.value
                  ? 'bg-white/20 border-white/40 text-white font-semibold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {c.label}
            </Link>
          ))}
          <span className="text-white/20 text-xs">|</span>
          {SURFACES.map((s) => (
            <Link
              key={s.value}
              href={filterLink('surface', s.value)}
              className={`px-3 py-1 rounded-full text-xs transition-all border ${
                surface === s.value
                  ? 'bg-white/20 border-white/40 text-white font-semibold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {s.label}
            </Link>
          ))}
          <div className="ml-auto flex gap-1.5">
            {[
              { value: 'popular', label: '인기순' },
              { value: 'rating', label: '평점순' },
              { value: 'new', label: '신제품순' },
            ].map((s) => (
              <Link
                key={s.value}
                href={filterLink('sort', s.value)}
                className={`px-3 py-1 rounded-full text-xs transition-all border ${
                  sort === s.value
                    ? 'bg-[#FF4D00] border-[#FF4D00] text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 제품 그리드 */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-white/30">조건에 맞는 러닝화가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
