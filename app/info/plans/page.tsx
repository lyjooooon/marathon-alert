import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

interface Plan {
  id: string
  title: string
  target_distance: string
  target_level: string
  duration_weeks: number
  description: string
}

const DISTANCE_LABEL: Record<string, string> = { '5k': '5K', '10k': '10K', 'half': '하프마라톤', 'full': '풀마라톤' }
const LEVEL_LABEL: Record<string, { label: string; color: string }> = {
  beginner:     { label: '입문', color: '#22c55e' },
  intermediate: { label: '중급', color: '#3b82f6' },
  advanced:     { label: '고급', color: '#FF4D00' },
}

export default async function PlansPage() {
  const { data: plans } = await getSupabase().from('training_plans').select('*').order('target_distance').order('target_level')

  const grouped = (plans ?? []).reduce((acc: Record<string, Plan[]>, p: Plan) => {
    const key = p.target_distance
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/info" className="text-white/40 hover:text-white text-sm transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-black text-white">트레이닝 플랜</h1>
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-4xl mb-3">📋</p>
          <p>아직 플랜이 없습니다. Supabase SQL Editor에서 02_info_hub.sql을 실행해주세요.</p>
        </div>
      ) : (
        ['5k', '10k', 'half', 'full'].filter(d => grouped[d]).map((dist) => (
          <div key={dist} className="mb-8">
            <h2 className="text-white font-bold text-lg mb-3">{DISTANCE_LABEL[dist]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {grouped[dist].map((plan: Plan) => {
                const lv = LEVEL_LABEL[plan.target_level]
                return (
                  <Link
                    key={plan.id}
                    href={`/info/plans/${plan.id}`}
                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${lv.color}22`, color: lv.color }}>{lv.label}</span>
                      <span className="text-white/40 text-xs">{plan.duration_weeks}주 프로그램</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{plan.title}</h3>
                    <p className="text-white/50 text-sm line-clamp-2">{plan.description}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
