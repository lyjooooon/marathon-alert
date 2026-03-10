import Link from 'next/link'
import StarRating from '@/components/ui/StarRating'

type Product = {
  id: string
  name: string
  brand: string
  images: string[]
  avg_rating: number
  review_count: number
  collection_count: number
  weight_g?: number
  cushion_type?: string
  surface?: string
  price_krw?: number
}

const CUSHION_LABEL: Record<string, string> = {
  max: '맥스쿠션',
  moderate: '미들쿠션',
  minimal: '미니멀',
  racing: '레이싱',
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shoes/${product.id}`}
      className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
    >
      {/* 이미지 */}
      <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl opacity-20">👟</span>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        <p className="text-white/40 text-xs mb-0.5">{product.brand}</p>
        <p className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">{product.name}</p>

        {/* 별점 */}
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating value={Number(product.avg_rating)} readonly size="sm" />
          <span className="text-white text-xs font-semibold">{Number(product.avg_rating).toFixed(1)}</span>
          <span className="text-white/30 text-xs">({product.review_count})</span>
        </div>

        {/* 태그 */}
        <div className="flex gap-1 flex-wrap">
          {product.cushion_type && (
            <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">
              {CUSHION_LABEL[product.cushion_type] ?? product.cushion_type}
            </span>
          )}
          {product.weight_g && (
            <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded">
              {product.weight_g}g
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
