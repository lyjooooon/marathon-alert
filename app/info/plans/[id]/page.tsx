import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

const LEVEL_LABEL: Record<string, string> = {
  beginner: '입문', intermediate: '중급', advanced: '고급'
}
const DISTANCE_LABEL: Record<string, string> = {
  '5k': '5K', '10k': '10K', 'half': '하프마라톤', 'full': '풀마라톤'
}

interface Session { day: string; type: string; distance: string; notes: string }
interface Week { week: number; theme: string; sessions: Session[] }

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const { data: plan } = await getSupabase()
    .from('training_plans')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!plan) notFound()

  const weeks: Week[] = plan.weekly_structure ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/info" className="text-white/40 hover:text-white transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <Link href="/info/plans" className="text-white/40 hover:text-white transition-colors">트레이닝 플랜</Link>
        <span className="text-white/20">/</span>
        <span className="text-white/60">{plan.title}</span>
      </div>

      {/* 헤더 */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#FF4D00]/20 text-[#FF4D00]">
            {DISTANCE_LABEL[plan.target_distance]}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400">
            {LEVEL_LABEL[plan.target_level]}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5 text-white/50">
            {plan.duration_weeks}주 프로그램
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">{plan.title}</h1>
        <p className="text-white/60 text-sm leading-relaxed">{plan.description}</p>
      </div>

      {/* 주차별 커리큘럼 */}
      {weeks.length > 0 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-4">주차별 훈련 계획</h2>
          <div className="flex flex-col gap-4">
            {weeks.map((w: Week) => (
              <div key={w.week} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-bold">{w.week}주차</span>
                  {w.theme && <span className="text-white/40 text-xs">{w.theme}</span>}
                </div>
                <div className="divide-y divide-white/5">
                  {w.sessions?.map((s: Session, i: number) => (
                    <div key={i} className="px-5 py-3 flex items-start gap-4">
                      <span className="text-[#FF4D00] font-bold text-sm w-6 shrink-0">{s.day}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-sm font-semibold">{s.type}</span>
                          {s.distance && s.distance !== '-' && (
                            <span className="text-white/40 text-xs">{s.distance}</span>
                          )}
                        </div>
                        {s.notes && <p className="text-white/40 text-xs mt-0.5">{s.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
