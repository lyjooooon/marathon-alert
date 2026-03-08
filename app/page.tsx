'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

const REGION_GRADIENTS: Record<string, string> = {
  '서울': 'from-blue-900 via-blue-700 to-blue-500',
  '경기': 'from-teal-900 via-teal-700 to-teal-500',
  '부산': 'from-cyan-900 via-cyan-700 to-cyan-500',
  '경북': 'from-amber-900 via-amber-700 to-amber-500',
  '강원': 'from-green-900 via-green-700 to-green-500',
  '제주': 'from-emerald-900 via-emerald-700 to-emerald-400',
  '대구': 'from-red-900 via-red-700 to-red-500',
  '전주': 'from-yellow-900 via-yellow-700 to-yellow-500',
  '인천': 'from-sky-900 via-sky-700 to-sky-500',
  '울산': 'from-orange-900 via-orange-700 to-orange-500',
  '창원': 'from-violet-900 via-violet-700 to-violet-500',
  '광주': 'from-pink-900 via-pink-700 to-pink-500',
}

function getGradient(location: string) {
  for (const [key, val] of Object.entries(REGION_GRADIENTS)) {
    if (location.includes(key)) return val
  }
  return 'from-gray-900 via-gray-700 to-gray-500'
}

function getDday(dateStr: string | null) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '마감'
  if (diff === 0) return 'D-DAY'
  return `D-${diff}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

const DISTANCE_FILTERS = ['전체', '풀코스', '하프', '10km', '5km']
const REGION_FILTERS = ['전체', '서울', '경기', '부산', '강원', '경북', '제주', '대구', '인천', '전주', '울산', '창원', '광주']

export default function Home() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [distanceFilter, setDistanceFilter] = useState('전체')
  const [regionFilter, setRegionFilter] = useState('전체')

  useEffect(() => {
    fetchRaces()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distanceFilter, regionFilter])

  async function fetchRaces() {
    setLoading(true)
    const params = new URLSearchParams()
    if (distanceFilter !== '전체') params.set('distance', distanceFilter)
    if (regionFilter !== '전체') params.set('location', regionFilter)
    const res = await fetch(`/api/races?${params}`)
    const data = await res.json()
    setRaces(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen" style={{ background: '#0f0f0f', color: '#fff' }}>
      {/* 헤더 */}
      <header style={{ background: '#111', borderBottom: '1px solid #222' }} className="px-4 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: '#FF4D00' }}>RUN KOREA</p>
            <h1 className="text-2xl font-black tracking-tight">마라톤 대회 알림 🏃</h1>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#888' }}>총 {races.length}개 대회</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 거리 필터 */}
        <div className="mb-3">
          <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>거리</p>
          <div className="flex gap-2 flex-wrap">
            {DISTANCE_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDistanceFilter(d)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: distanceFilter === d ? '#FF4D00' : '#1e1e1e',
                  color: distanceFilter === d ? '#fff' : '#aaa',
                  border: distanceFilter === d ? '1px solid #FF4D00' : '1px solid #333',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 지역 필터 */}
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>지역</p>
          <div className="flex gap-2 flex-wrap">
            {REGION_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: regionFilter === r ? '#FF4D00' : '#1e1e1e',
                  color: regionFilter === r ? '#fff' : '#aaa',
                  border: regionFilter === r ? '1px solid #FF4D00' : '1px solid #333',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 대회 카드 목록 */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#555' }}>불러오는 중...</div>
        ) : races.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#555' }}>
            <p className="text-5xl mb-4">🏃</p>
            <p>해당 조건의 대회가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {races.map((race) => {
              const dday = getDday(race.registration_end)
              const gradient = getGradient(race.location)
              const isDeadline = dday === '마감'
              return (
                <div
                  key={race.id}
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  {/* 카드 상단 그라디언트 영역 */}
                  <div className={`bg-gradient-to-br ${gradient} px-5 py-6 relative`}>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-1">
                        {race.distances?.map((d) => (
                          <span
                            key={d}
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      {dday && !isDeadline && (
                        <span
                          className="text-xs font-black px-2 py-1 rounded-lg"
                          style={{ background: '#FF4D00', color: '#fff' }}
                        >
                          접수 {dday}
                        </span>
                      )}
                      {isDeadline && (
                        <span
                          className="text-xs font-black px-2 py-1 rounded-lg"
                          style={{ background: '#333', color: '#888' }}
                        >
                          접수마감
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      📍 {race.location}
                    </p>
                  </div>

                  {/* 카드 하단 정보 */}
                  <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                    <h2 className="font-black text-base leading-tight" style={{ color: '#fff' }}>
                      {race.title}
                    </h2>

                    <div className="text-sm" style={{ color: '#aaa' }}>
                      <span className="font-semibold" style={{ color: '#FF4D00' }}>대회일</span>
                      <span className="ml-2">{formatDate(race.date)}</span>
                    </div>

                    {/* 접수기간 강조 박스 */}
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: '#111', border: '1px solid #2e2e2e' }}
                    >
                      <p className="text-xs font-bold mb-1" style={{ color: '#FF4D00' }}>📝 접수기간</p>
                      {race.registration_start || race.registration_end ? (
                        <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                          {formatDate(race.registration_start)} ~<br />
                          {formatDate(race.registration_end)}
                        </p>
                      ) : (
                        <p className="text-sm" style={{ color: '#555' }}>미정</p>
                      )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <a
                        href={race.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: '#2a2a2a', color: '#ccc', border: '1px solid #333' }}
                      >
                        대회 페이지
                      </a>
                      <Link
                        href={`/races/${race.id}`}
                        className="flex-1 text-center py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ background: '#FF4D00', color: '#fff' }}
                      >
                        🔔 알림 신청
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
