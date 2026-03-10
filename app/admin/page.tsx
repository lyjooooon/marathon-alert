import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'

async function getStats() {
  const db = getSupabaseAdmin()
  const [products, reviews, suggestions] = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }),
    db.from('reviews').select('id', { count: 'exact', head: true }),
    db.from('product_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return {
    products: products.count ?? 0,
    reviews: reviews.count ?? 0,
    suggestions: suggestions.count ?? 0,
  }
}

const STAT_CARDS = [
  { key: 'products', label: '제품', icon: '👟', href: '/admin/products' },
  { key: 'reviews', label: '리뷰', icon: '⭐', href: '/admin/products' },
  { key: 'suggestions', label: '제안 (검토중)', icon: '📥', href: '/admin/suggestions' },
]

const NAV_LINKS = [
  { href: '/admin/products', label: '제품 관리', icon: '👟' },
  { href: '/admin/suggestions', label: '제품 제안', icon: '📥' },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">대시보드</h1>
      <p className="text-white/40 text-sm mb-8">SOLE 콘텐츠 관리</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-3xl font-black text-white mb-1">
              {stats[card.key as keyof typeof stats]}
            </div>
            <div className="text-white/40 text-xs group-hover:text-white/60 transition-colors">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 hover:border-[#FF4D00]/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon}</span>
              <span className="text-white font-semibold text-sm">{link.label}</span>
            </div>
            <span className="text-white/30 text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
