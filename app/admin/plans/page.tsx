'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Plan = {
  id: string
  title: string
  target_distance: string
  target_level: string
  duration_weeks: number
}

const LEVEL_COLORS: Record<string, string> = { beginner: '#22c55e', intermediate: '#3b82f6', advanced: '#FF4D00' }
const LEVEL_LABELS: Record<string, string> = { beginner: '입문', intermediate: '중급', advanced: '고급' }
const DIST_LABELS: Record<string, string> = { '5k': '5K', '10k': '10K', half: '하프', full: '풀' }

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/plans')
    if (res.ok) setPlans(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPlans() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 플랜을 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
    fetchPlans()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">트레이닝 플랜</h1>
          <p className="text-white/40 text-xs mt-0.5">{plans.length}개</p>
        </div>
        <Link href="/admin/plans/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
          + 새 플랜
        </Link>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                    {DIST_LABELS[plan.target_distance] ?? plan.target_distance}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${LEVEL_COLORS[plan.target_level]}22`, color: LEVEL_COLORS[plan.target_level] }}>
                    {LEVEL_LABELS[plan.target_level] ?? plan.target_level}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm">{plan.title}</p>
                <p className="text-white/30 text-xs mt-0.5">{plan.duration_weeks}주</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/plans/${plan.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors">수정</Link>
                <button onClick={() => handleDelete(plan.id, plan.title)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
