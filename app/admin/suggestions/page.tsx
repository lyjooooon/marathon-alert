'use client'

import { useState, useEffect } from 'react'

type Suggestion = {
  id: string
  name: string
  brand: string
  category: string
  note: string | null
  reference_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles: { username: string } | null
}

const STATUS_LABEL = {
  pending: { label: '검토중', color: 'text-yellow-400 bg-yellow-400/10' },
  approved: { label: '승인', color: 'text-green-400 bg-green-400/10' },
  rejected: { label: '거절', color: 'text-red-400 bg-red-400/10' },
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  async function fetchSuggestions() {
    const res = await fetch('/api/admin/suggestions')
    if (res.ok) setSuggestions(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchSuggestions() }, [])

  async function handleStatus(id: string, status: 'approved' | 'rejected') {
    await fetch(`/api/admin/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchSuggestions()
  }

  const filtered = filter === 'all' ? suggestions : suggestions.filter((s) => s.status === filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">제품 제안</h1>
        <p className="text-white/40 text-xs mt-0.5">유저가 요청한 제품 등록 제안</p>
      </div>

      <div className="flex gap-1.5 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs transition-all border ${
              filter === f ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            {f === 'all' ? '전체' : STATUS_LABEL[f].label}
            {f !== 'all' && <span className="ml-1 text-white/30">({suggestions.filter((s) => s.status === f).length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-12">제안이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const profile = Array.isArray(s.profiles) ? (s.profiles[0] ?? null) : s.profiles
            const st = STATUS_LABEL[s.status]
            return (
              <div key={s.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${st.color}`}>{st.label}</span>
                      <span className="text-white/30 text-xs">{new Date(s.created_at).toLocaleDateString('ko-KR')}</span>
                      <span className="text-white/30 text-xs">by {profile?.username ?? '알 수 없음'}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{s.brand} {s.name}</p>
                    {s.note && <p className="text-white/40 text-xs mt-1">{s.note}</p>}
                    {s.reference_url && (
                      <a href={s.reference_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#FF4D00] text-xs mt-1 inline-block hover:underline">
                        참고 링크 →
                      </a>
                    )}
                  </div>
                  {s.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleStatus(s.id, 'approved')}
                        className="text-xs text-green-400 hover:text-green-300 border border-green-400/30 hover:border-green-400/60 px-3 py-1 rounded-lg transition-all"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleStatus(s.id, 'rejected')}
                        className="text-xs text-red-400/60 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-3 py-1 rounded-lg transition-all"
                      >
                        거절
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
