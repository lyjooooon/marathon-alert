import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'

async function getStats() {
  const db = getSupabaseAdmin()
  const [races, columns, plans, courses, posts] = await Promise.all([
    db.from('races').select('id', { count: 'exact', head: true }),
    db.from('columns').select('id', { count: 'exact', head: true }),
    db.from('training_plans').select('id', { count: 'exact', head: true }),
    db.from('course_maps').select('id', { count: 'exact', head: true }),
    db.from('info_posts').select('id', { count: 'exact', head: true }),
  ])
  return {
    races: races.count ?? 0,
    columns: columns.count ?? 0,
    plans: plans.count ?? 0,
    courses: courses.count ?? 0,
    posts: posts.count ?? 0,
  }
}

const STAT_CARDS = [
  { key: 'races', label: '대회', icon: '🏃', href: '/admin/races' },
  { key: 'columns', label: '전문가 칼럼', icon: '✍️', href: '/admin/columns' },
  { key: 'plans', label: '트레이닝 플랜', icon: '📋', href: '/admin/plans' },
  { key: 'courses', label: '코스 지도', icon: '🗺️', href: '/admin/courses' },
  { key: 'posts', label: '유저 포스트', icon: '💬', href: '/admin/posts' },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">대시보드</h1>
      <p className="text-white/40 text-sm mb-8">RUN IN ONE 콘텐츠 관리</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
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
        {STAT_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 hover:border-[#FF4D00]/40 hover:bg-[#1a1a1a] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{card.icon}</span>
              <span className="text-white font-semibold text-sm">{card.label} 관리</span>
            </div>
            <span className="text-white/30 text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
