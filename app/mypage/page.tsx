'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

type Status = 'wishlist' | 'registered' | 'completed' | 'dnf'

interface Participation {
  id: string
  status: Status
  finish_time: string | null
  notes: string | null
  created_at: string
  races: {
    id: string
    title: string
    date: string
    location: string
    distances: string[]
    registration_end: string | null
    url: string
  }
}

const STATUS_LABELS: Record<Status, { label: string; color: string; bg: string }> = {
  wishlist:   { label: '관심',    color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  registered: { label: '신청완료', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  completed:  { label: '완주',    color: '#FF4D00', bg: 'rgba(255,77,0,0.15)' },
  dnf:        { label: 'DNF',    color: '#888',    bg: 'rgba(100,100,100,0.15)' },
}

const STATUS_ORDER: Status[] = ['wishlist', 'registered', 'completed', 'dnf']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [participations, setParticipations] = useState<Participation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'races' | 'settings'>('races')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login?next=/mypage')
        return
      }
      setUser(data.user)
      const res = await fetch('/api/participations')
      if (res.ok) setParticipations(await res.json())
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: string, status: Status) => {
    await fetch(`/api/participations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setParticipations((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/participations/${id}`, { method: 'DELETE' })
    setParticipations((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 text-white/40 text-center">로딩 중...</div>
  if (!user) return null

  const username = user.user_metadata?.preferred_username ?? user.email?.split('@')[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 프로필 카드 */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#FF4D00] flex items-center justify-center text-white text-2xl font-black shrink-0">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-lg truncate">{username}</p>
          <p className="text-white/40 text-sm truncate">{user.email}</p>
        </div>
        <Link href="/" className="text-white/40 text-xs hover:text-white transition-colors">대회센터 →</Link>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-[#1a1a1a] rounded-xl p-1 border border-white/5">
        {(['races', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: activeTab === tab ? '#FF4D00' : 'transparent', color: activeTab === tab ? '#fff' : '#888' }}
          >
            {tab === 'races' ? `대회 기록 (${participations.length})` : '설정'}
          </button>
        ))}
      </div>

      {activeTab === 'races' && (
        participations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏅</p>
            <p className="text-white/40 text-sm mb-4">아직 관심 대회가 없어요</p>
            <Link href="/" className="inline-block px-5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF4D00' }}>
              대회 둘러보기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {participations.map((p) => {
              const sc = STATUS_LABELS[p.status]
              return (
                <div key={p.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{p.races?.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">📅 {formatDate(p.races?.date)} · 📍 {p.races?.location?.split(' ').slice(0, 2).join(' ')}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.races?.distances?.map((d) => (
                          <span key={d} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#2a2a2a', color: '#666' }}>{d}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="text-white/20 hover:text-white/60 text-lg transition-colors shrink-0" title="삭제">×</button>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(p.id, s)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: p.status === s ? STATUS_LABELS[s].bg : '#2a2a2a',
                          color: p.status === s ? STATUS_LABELS[s].color : '#555',
                          border: p.status === s ? `1px solid ${STATUS_LABELS[s].color}44` : '1px solid #333',
                        }}
                      >{STATUS_LABELS[s].label}</button>
                    ))}
                    <a href={p.races?.url} target="_blank" rel="noopener noreferrer" className="ml-auto px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#2a2a2a', color: '#888' }}>
                      대회 페이지 →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4">계정 설정</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-white/60">이메일</span>
              <span className="text-white/80">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-white/60">닉네임</span>
              <span className="text-white/80">{username}</span>
            </div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); router.refresh() }}
            className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
