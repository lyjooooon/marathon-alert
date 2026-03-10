'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors'
const selectCls = inputCls + ' appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function EditPlanPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDistance, setTargetDistance] = useState('5k')
  const [targetLevel, setTargetLevel] = useState('beginner')
  const [durationWeeks, setDurationWeeks] = useState('6')
  const [weeklyStructure, setWeeklyStructure] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/plans/${id}`).then((r) => r.json()).then((data) => {
      setTitle(data.title ?? '')
      setDescription(data.description ?? '')
      setTargetDistance(data.target_distance ?? '5k')
      setTargetLevel(data.target_level ?? 'beginner')
      setDurationWeeks(String(data.duration_weeks ?? 6))
      setWeeklyStructure(JSON.stringify(data.weekly_structure ?? [], null, 2))
      setFetching(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let parsedStructure
    try {
      parsedStructure = JSON.parse(weeklyStructure)
    } catch {
      setError('주차별 구성이 올바른 JSON 형식이 아닙니다.')
      setLoading(false)
      return
    }

    const res = await fetch(`/api/admin/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description,
        target_distance: targetDistance,
        target_level: targetLevel,
        duration_weeks: parseInt(durationWeeks),
        weekly_structure: parsedStructure,
      }),
    })

    if (res.ok) {
      router.push('/admin/plans')
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  if (fetching) return <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/plans" className="text-white/40 hover:text-white text-sm transition-colors">← 목록</Link>
        <h1 className="text-xl font-black text-white">플랜 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        <Field label="플랜 이름">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="목표 거리">
            <select value={targetDistance} onChange={(e) => setTargetDistance(e.target.value)} className={selectCls}>
              <option value="5k">5K</option>
              <option value="10k">10K</option>
              <option value="half">하프마라톤</option>
              <option value="full">풀마라톤</option>
            </select>
          </Field>
          <Field label="레벨">
            <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} className={selectCls}>
              <option value="beginner">입문</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </Field>
        </div>
        <Field label="훈련 기간 (주)">
          <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} required min={1} max={52} className={inputCls} />
        </Field>
        <Field label="설명">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + ' resize-none'} />
        </Field>
        <Field label="주차별 구성 (JSON)">
          <textarea value={weeklyStructure} onChange={(e) => setWeeklyStructure(e.target.value)} rows={10} className={inputCls + ' resize-y font-mono text-xs'} />
        </Field>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/plans" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">취소</Link>
          <button type="submit" disabled={loading} className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
