import { getSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import StarRating from '@/components/ui/StarRating'

type SortType = 'rating' | 'reviews' | 'collections'

async function getRanking(sort: SortType) {
  const db = getSupabaseAdmin()
  let query = db
    .from('products')
    .select('id, name, brand, images, avg_rating, review_count, collection_count, weight_g, cushion_type, surface')
    .eq('is_published', true)

  if (sort === 'rating') query = query.order('avg_rating', { ascending: false }).order('review_count', { ascending: false })
  else if (sort === 'reviews') query = query.order('review_count', { ascending: false })
  else query = query.order('collection_count', { ascending: false })

  query = query.limit(30)
  const { data } = await query
  return data ?? []
}

const CUSHION_LABEL: Record<string, string> = {
  max: '맥스쿠션', moderate: '미들쿠션', minimal: '미니멀', racing: '레이싱',
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { sort?: string }
}) {
  const sort = (searchParams.sort as SortType) || 'rating'
  const products = await getRanking(sort)

  const TABS: { value: SortType; label: string }[] = [
    { value: 'rating', label: '평점순' },
    { value: 'reviews', label: '리뷰수순' },
    { value: 'collections', label: '컬렉션순' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">러닝화 랭킹</h1>
        <p className="text-white/40 text-sm mt-0.5">유저 평가 기반 순위</p>
      </div>

      {/* 정렬 탭 */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/ranking?sort=${tab.value}`}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-center transition-all ${
              sort === tab.value ? 'bg-[#FF4D00] text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 순위 목록 */}
      <div className="space-y-2">
        {products.map((p, i) => (
          <Link
            key={p.id}
            href={`/shoes/${p.id}`}
            className="flex items-center gap-4 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3.5 hover:border-white/20 transition-all"
          >
            {/* 순위 */}
            <span className={`text-lg font-black w-6 text-center shrink-0 ${
              i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/60' : i === 2 ? 'text-orange-400' : 'text-white/20'
            }`}>
              {i + 1}
            </span>

            {/* 이미지 */}
            <div className="w-12 h-12 shrink-0 bg-white/5 rounded-lg overflow-hidden">
              {p.images?.[0]
                ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">👟</div>
              }
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs">{p.brand}</p>
              <p className="text-white font-semibold text-sm truncate">{p.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {p.cushion_type && (
                  <span className="text-[10px] text-white/30">{CUSHION_LABEL[p.cushion_type] ?? p.cushion_type}</span>
                )}
                {p.weight_g && <span className="text-[10px] text-white/30">{p.weight_g}g</span>}
              </div>
            </div>

            {/* 스탯 */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end mb-0.5">
                <StarRating value={Number(p.avg_rating)} readonly size="sm" />
                <span className="text-white font-bold text-sm">{Number(p.avg_rating).toFixed(1)}</span>
              </div>
              <p className="text-white/30 text-xs">리뷰 {p.review_count} · 컬렉션 {p.collection_count}</p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16 text-white/30">아직 데이터가 없습니다.</div>
      )}
    </div>
  )
}
