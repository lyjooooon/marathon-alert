'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Race {
  id: string
  title: string
  date: string
  location: string
  distances: string[]
  registration_start: string | null
  registration_end: string | null
  url: string
}

type Status = '접수중' | '접수예정' | '접수마감' | '대회종료'
type ViewMode = 'card' | 'list'

const REGION_GRADIENTS: Record<string, string> = {
  '서울': 'from-blue-900 via-blue-700 to-blue-500',
  '경기': 'from-teal-900 via-teal-700 to-teal-500',
  '부산': 'from-cyan-900 via-cyan-700 to-cyan-500',
  '경북': 'from-amber-900 via-amber-700 to-amber-500',
  '강원': 'from-green-900 via-green-700 to-green-500',
  '제주': 'from-emerald-900 via-emerald-700 to-emerald-400',
  '대구': 'from-red-900 via-red-700 to-red-500',
  '전주': 'from-yellow-900 via-yellow-700 to-yellow-500',
  '전북': 'from-yellow-900 via-yellow-700 to-yellow-500',
  '인천': 'from-sky-900 via-sky-700 to-sky-500',
  '울산': 'from-orange-900 via-orange-700 to-orange-500',
  '창원': 'from-violet-900 via-violet-700 to-violet-500',
  '경남': 'from-violet-900 via-violet-700 to-violet-500',
  '광주': 'from-pink-900 via-pink-700 to-pink-500',
  '전남': 'from-lime-900 via-lime-700 to-lime-500',
}

function getGradient(location: string) {
  for (const [key, val] of Object.entries(REGION_GRADIENTS)) {
    if (location.includes(key)) return val
  }
  return 'from-gray-900 via-gray-700 to-gray-500'
}

function getStatus(race: Race): Status {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const raceDate = new Date(race.date)
  const regStart = race.registration_start ? new Date(race.registration_start) : null
  const regEnd = race.registration_end ? new Date(race.registration_end) : null

  if (raceDate < today) return '대회종료'
  if (regEnd && regEnd < today) return '접수마감'
  if (regStart && regStart > today) return '접수예정'
  return '접수중'
}

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; dot?: boolean }> = {
  '접수중':   { label: '접수중',  bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', dot: true },
  '접수예정': { label: '접수예정', bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  '접수마감': { label: '접수마감', bg: 'rgba(100,100,100,0.2)',  color: '#888' },
  '대회종료': { label: '대회종료', bg: 'rgba(60,60,60,0.2)',     color: '#555' },
}

function getDday(dateStr: string | null) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'D-DAY'
  return `D-${diff}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

function formatShort(dateStr: string | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const STATUS_FILTERS = ['전체', '접수중', '접수예정', '접수마감'] as const
const DISTANCE_FILTERS = ['전체', '풀코스', '하프', '10km', '5km']
const REGION_FILTERS = ['전체', '서울', '경기', '부산', '강원', '경북', '제주', '대구', '인천', '전주', '울산', '창원', '광주']
const ORDER: Record<Status, number> = { '접수중': 0, '접수예정': 1, '접수마감': 2, '대회종료': 3 }

// ──────────────────────────────
// 카카오 OAuth 훅
// ──────────────────────────────
function useKakaoAuth() {
  const [kakaoToken, setKakaoToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

  const login = useCallback(() => {
    if (!appKey) return
    const redirectUri = `${window.location.origin}/api/auth/kakao`
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${appKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
    const popup = window.open(url, 'kakao-auth', 'width=500,height=700,left=200,top=100')
    setLoading(true)

    const handler = (e: MessageEvent) => {
      if (e.data?.kakaoToken) {
        setKakaoToken(e.data.kakaoToken)
        setLoading(false)
        window.removeEventListener('message', handler)
        popup?.close()
      } else if (e.data?.kakaoError) {
        setLoading(false)
        window.removeEventListener('message', handler)
        alert('카카오 로그인에 실패했습니다.')
      }
    }
    window.addEventListener('message', handler)
  }, [appKey])

  return { kakaoToken, loading, login, reset: () => setKakaoToken(null), hasAppKey: !!appKey }
}

// ──────────────────────────────
// 알림 신청 모달
// ──────────────────────────────
function SubscribeModal({ race, onClose }: { race: Race; onClose: () => void }) {
  const [form, setForm] = useState({ email: '', notify_days_before: '3' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [useKakao, setUseKakao] = useState(false)
  const kakao = useKakaoAuth()
  const gradient = getGradient(race.location)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    let push_subscription = null
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        push_subscription = existing
          ? existing.toJSON()
          : (await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            })).toJSON()
      } catch { /* 권한 거부 시 이메일만 */ }
    }

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race_id: race.id,
        email: form.email,
        kakao_token: useKakao ? kakao.kakaoToken : null,
        push_subscription,
        notify_days_before: Number(form.notify_days_before),
      }),
    })

    setSubmitting(false)
    if (res.ok) setSuccess(true)
    else alert('오류가 발생했습니다. 다시 시도해주세요.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        {/* 헤더 */}
        <div className={`bg-gradient-to-br ${gradient} px-5 py-5`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>🔔 알림 신청</p>
              <h2 className="font-black text-lg text-white leading-tight">{race.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none ml-4">×</button>
          </div>
          <div className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <span>📅 대회일 {formatDate(race.date)}</span>
          </div>
          <div className="mt-3 rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#FF4D00' }}>📝 접수기간</p>
            <p className="text-sm font-semibold text-white">
              {formatDate(race.registration_start)} ~ {formatDate(race.registration_end)}
            </p>
          </div>
        </div>

        {/* 바디 */}
        <div className="px-5 py-5">
          {success ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-black text-white text-lg">알림 신청 완료!</p>
              <p className="text-sm mt-2" style={{ color: '#888' }}>
                접수 마감 {form.notify_days_before}일 전에 알림을 보내드릴게요.
              </p>
              <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl font-bold text-white" style={{ background: '#FF4D00' }}>
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>이메일 *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                />
              </div>

              {/* 카카오 알림 */}
              <div className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="text-sm font-semibold" style={{ color: '#ccc' }}>카카오톡 알림</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUseKakao((v) => !v); if (useKakao) kakao.reset() }}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ background: useKakao ? '#FF4D00' : '#333' }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: useKakao ? '24px' : '4px' }}
                    />
                  </button>
                </div>
                {useKakao && (
                  <div>
                    {kakao.kakaoToken ? (
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}>
                        <span>✓</span>
                        <span>카카오 연동 완료</span>
                        <button type="button" onClick={kakao.reset} className="ml-auto text-xs" style={{ color: '#666' }}>연동 해제</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={kakao.login}
                        disabled={kakao.loading || !kakao.hasAppKey}
                        className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity"
                        style={{ background: '#FEE500', color: '#191919', opacity: (kakao.loading || !kakao.hasAppKey) ? 0.6 : 1 }}
                      >
                        {kakao.loading ? '연동 중...' : '카카오로 로그인'}
                      </button>
                    )}
                    {!kakao.hasAppKey && (
                      <p className="text-xs mt-2" style={{ color: '#555' }}>카카오 앱 키가 설정되지 않았습니다.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 알림 시점 */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#ccc' }}>접수 마감 며칠 전에 알림 받을까요?</label>
                <div className="flex gap-2">
                  {['1', '3', '7', '14'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, notify_days_before: d }))}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: form.notify_days_before === d ? '#FF4D00' : '#2a2a2a',
                        color: form.notify_days_before === d ? '#fff' : '#888',
                        border: form.notify_days_before === d ? '1px solid #FF4D00' : '1px solid #333',
                      }}
                    >
                      {d === '14' ? '2주' : `${d}일`} 전
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-black text-white transition-opacity"
                style={{ background: '#FF4D00', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? '신청 중...' : '🔔 알림 신청하기'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────
// 카드 뷰
// ──────────────────────────────
function CardView({ races, onAlert, wishlist, onWishlist }: { races: Race[]; onAlert: (r: Race) => void; wishlist: Set<string>; onWishlist: (r: Race) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {races.map((race) => {
        const status = getStatus(race)
        const sc = STATUS_CONFIG[status]
        const dday = getDday(race.registration_end)
        const gradient = getGradient(race.location)
        const faded = status === '대회종료'

        return (
          <div
            key={race.id}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', opacity: faded ? 0.45 : 1 }}
          >
            <div className={`bg-gradient-to-br ${gradient} px-4 py-5`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-1">
                  {race.distances?.map((d) => (
                    <span key={d} className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{d}</span>
                  ))}
                </div>
                <span className="text-xs font-black px-2 py-1 rounded-lg shrink-0 ml-2 flex items-center gap-1" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>
                  {sc.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
                  {sc.label}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>📍 {race.location}</p>
            </div>

            <div className="px-4 py-4 flex flex-col gap-3 flex-1">
              <h2 className="font-black text-base leading-tight text-white">{race.title}</h2>
              <div className="text-sm" style={{ color: '#aaa' }}>
                <span className="font-semibold" style={{ color: '#FF4D00' }}>대회일</span>
                <span className="ml-2">{formatDate(race.date)}</span>
              </div>
              <div className="rounded-xl px-3 py-3" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold" style={{ color: '#FF4D00' }}>📝 접수기간</p>
                  {dday && status === '접수중' && (
                    <span className="text-xs font-black" style={{ color: '#22c55e' }}>{dday}</span>
                  )}
                </div>
                {race.registration_start || race.registration_end ? (
                  <p className="text-sm font-semibold text-white">
                    {formatDate(race.registration_start)}<br />~ {formatDate(race.registration_end)}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: '#555' }}>미정</p>
                )}
              </div>
              <div className="flex gap-2 mt-auto pt-1">
                <a href={race.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-xl text-sm font-semibold" style={{ background: '#2a2a2a', color: '#ccc', border: '1px solid #333' }}>
                  대회 페이지
                </a>
                <button
                  onClick={() => onWishlist(race)}
                  title={wishlist.has(race.id) ? '관심 대회에 담김' : '관심 대회 담기'}
                  className="px-3 py-2 rounded-xl text-sm transition-colors"
                  style={{ background: wishlist.has(race.id) ? 'rgba(255,77,0,0.2)' : '#2a2a2a', color: wishlist.has(race.id) ? '#FF4D00' : '#555', border: '1px solid #333' }}
                >
                  {wishlist.has(race.id) ? '♥' : '♡'}
                </button>
                {status !== '대회종료' && (
                  <button onClick={() => onAlert(race)} className="flex-1 text-center py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF4D00' }}>
                    🔔 알림
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────
// 리스트 뷰
// ──────────────────────────────
function ListView({ races, onAlert, wishlist, onWishlist }: { races: Race[]; onAlert: (r: Race) => void; wishlist: Set<string>; onWishlist: (r: Race) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {races.map((race) => {
        const status = getStatus(race)
        const sc = STATUS_CONFIG[status]
        const dday = getDday(race.registration_end)
        const faded = status === '대회종료'

        return (
          <div
            key={race.id}
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', opacity: faded ? 0.45 : 1 }}
          >
            <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0 text-center" style={{ background: sc.bg, color: sc.color, minWidth: '56px' }}>
              {sc.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">{race.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="text-xs" style={{ color: '#888' }}>📅 {formatShort(race.date)}</span>
                <span className="text-xs" style={{ color: '#888' }}>📍 {race.location.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-xs" style={{ color: '#666' }}>
                  접수 {formatShort(race.registration_start)}~{formatShort(race.registration_end)}
                  {dday && status === '접수중' && <span style={{ color: '#22c55e' }}> {dday}</span>}
                </span>
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {race.distances?.map((d) => (
                  <span key={d} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#2a2a2a', color: '#777' }}>{d}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <a href={race.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg text-center font-semibold" style={{ background: '#2a2a2a', color: '#aaa' }}>
                페이지
              </a>
              <button
                onClick={() => onWishlist(race)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold text-center transition-colors"
                style={{ background: wishlist.has(race.id) ? 'rgba(255,77,0,0.2)' : '#2a2a2a', color: wishlist.has(race.id) ? '#FF4D00' : '#888' }}
              >
                {wishlist.has(race.id) ? '♥' : '♡'}
              </button>
              {status !== '대회종료' && (
                <button onClick={() => onAlert(race)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white" style={{ background: '#FF4D00' }}>
                  알림
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────
// 메인
// ──────────────────────────────
export default function Home() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('전체')
  const [distanceFilter, setDistanceFilter] = useState('전체')
  const [regionFilter, setRegionFilter] = useState('전체')
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        fetch('/api/participations').then(r => r.json()).then((list) => {
          if (Array.isArray(list)) setWishlist(new Set(list.map((p: { races: { id: string } }) => p.races?.id)))
        })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWishlist = async (race: Race) => {
    if (!userId) { window.location.href = '/login?next=/'; return }
    const isIn = wishlist.has(race.id)
    if (isIn) return // 이미 담긴 경우 마이페이지로
    await fetch('/api/participations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race_id: race.id, status: 'wishlist' }),
    })
    setWishlist((prev) => { const s = new Set(prev); s.add(race.id); return s })
  }

  useEffect(() => { fetchRaces() }, [statusFilter, distanceFilter, regionFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchRaces() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== '전체') params.set('status', statusFilter)
    if (distanceFilter !== '전체') params.set('distance', distanceFilter)
    if (regionFilter !== '전체') params.set('location', regionFilter)
    const res = await fetch(`/api/races?${params}`)
    const data = await res.json()

    const sorted = (Array.isArray(data) ? data : []).sort((a: Race, b: Race) => {
      const diff = ORDER[getStatus(a)] - ORDER[getStatus(b)]
      if (diff !== 0) return diff
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    setRaces(sorted)
    setLoading(false)
  }

  const filterBtn = (active: boolean) => ({
    background: active ? '#FF4D00' : '#1e1e1e',
    color: active ? '#fff' : '#aaa',
    border: active ? '1px solid #FF4D00' : '1px solid #333',
  })

  return (
    <div className="min-h-screen" style={{ color: '#fff' }}>
      {selectedRace && <SubscribeModal race={selectedRace} onClose={() => setSelectedRace(null)} />}

      {/* 서브 헤더 — 필터 컨트롤 */}
      <header style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }} className="px-4 py-3 sticky md:top-14 top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight">대회 센터</h1>
            <p className="text-xs" style={{ color: '#555' }}>국내 마라톤 · 러닝 대회 정보</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs" style={{ color: '#555' }}>{races.length}개 대회</p>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
              <button
                onClick={() => setViewMode('card')}
                className="px-3 py-1.5 text-sm font-bold transition-colors"
                style={{ background: viewMode === 'card' ? '#FF4D00' : '#1a1a1a', color: viewMode === 'card' ? '#fff' : '#555' }}
                title="카드 뷰"
              >▦</button>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 py-1.5 text-sm font-bold transition-colors"
                style={{ background: viewMode === 'list' ? '#FF4D00' : '#1a1a1a', color: viewMode === 'list' ? '#fff' : '#555' }}
                title="리스트 뷰"
              >☰</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* 상태 필터 탭 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
              style={filterBtn(statusFilter === s)}
            >
              {s === '접수중' && statusFilter !== s && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
              {s}
            </button>
          ))}
        </div>

        {/* 거리 필터 */}
        <div className="mb-2">
          <p className="text-xs font-semibold mb-2" style={{ color: '#555' }}>거리</p>
          <div className="flex gap-2 flex-wrap">
            {DISTANCE_FILTERS.map((d) => (
              <button key={d} onClick={() => setDistanceFilter(d)} className="px-3 py-1 rounded-full text-xs font-semibold transition-all" style={filterBtn(distanceFilter === d)}>{d}</button>
            ))}
          </div>
        </div>

        {/* 지역 필터 */}
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2" style={{ color: '#555' }}>지역</p>
          <div className="flex gap-2 flex-wrap">
            {REGION_FILTERS.map((r) => (
              <button key={r} onClick={() => setRegionFilter(r)} className="px-3 py-1 rounded-full text-xs font-semibold transition-all" style={filterBtn(regionFilter === r)}>{r}</button>
            ))}
          </div>
        </div>

        {/* 대회 목록 */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#555' }}>불러오는 중...</div>
        ) : races.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#555' }}>
            <p className="text-5xl mb-4">🏃</p>
            <p>해당 조건의 대회가 없습니다.</p>
          </div>
        ) : viewMode === 'card' ? (
          <CardView races={races} onAlert={setSelectedRace} wishlist={wishlist} onWishlist={handleWishlist} />
        ) : (
          <ListView races={races} onAlert={setSelectedRace} wishlist={wishlist} onWishlist={handleWishlist} />
        )}
      </div>
    </div>
  )
}
