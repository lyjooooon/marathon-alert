'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Race = {
  id: string
  title: string
  date: string
  location: string
  distances: string[]
  registration_start: string | null
  registration_end: string | null
  source: string
}

function getStatus(race: Race) {
  const today = new Date().toISOString().slice(0, 10)
  if (race.date < today) return { label: '대회종료', color: '#6b7280' }
  if (race.registration_end && race.registration_end < today) return { label: '접수마감', color: '#ef4444' }
  if (race.registration_start && race.registration_start > today) return { label: '접수예정', color: '#3b82f6' }
  return { label: '접수중', color: '#22c55e' }
}

export default function AdminRacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchRaces = async () => {
    const res = await fetch('/api/admin/races')
    if (res.ok) setRaces(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchRaces() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 대회를 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/races/${id}`, { method: 'DELETE' })
    fetchRaces()
  }

  const filtered = races.filter((r) =>
    r.title.includes(search) || r.location.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">대회 관리</h1>
          <p className="text-white/40 text-xs mt-0.5">{races.length}개</p>
        </div>
        <Link href="/admin/races/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
          + 새 대회
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="대회명 또는 지역 검색"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors mb-4"
      />

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-12">대회가 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((race) => {
            const status = getStatus(race)
            return (
              <div key={race.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${status.color}22`, color: status.color }}>
                      {status.label}
                    </span>
                    <span className="text-white/30 text-xs">{race.source}</span>
                  </div>
                  <p className="text-white font-semibold text-sm truncate">{race.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {race.date} · {race.location} · {race.distances?.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/races/${race.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors">수정</Link>
                  <button onClick={() => handleDelete(race.id, race.title)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">삭제</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
